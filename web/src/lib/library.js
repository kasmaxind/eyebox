const STORAGE_KEY = "eyebox-library-v1";

const defaults = {
  history: [],
  watchLater: [],
  continueWatching: [],
  playlists: [],
  signals: { categories: {}, channels: {}, videoIds: [] },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaults);
    return { ...structuredClone(defaults), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaults);
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function mutate(fn) {
  const data = load();
  fn(data);
  save(data);
  window.dispatchEvent(new CustomEvent("eyebox-library-change"));
  return data;
}

export function getLibrary() {
  return load();
}

export function getViewerSignals() {
  const { signals, history } = load();
  const categories = Object.entries(signals.categories || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c]) => c);
  const channels = Object.entries(signals.channels || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c]) => c);
  const videoIds = history.slice(0, 20).map((h) => h.id);
  return { categories, channels, videoIds, excludeIds: videoIds };
}

export function recordWatch(video, progress = 0) {
  mutate((data) => {
    const entry = {
      id: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      channel: video.channel?.name || "",
      watchedAt: new Date().toISOString(),
      progress,
    };

    data.history = [entry, ...data.history.filter((h) => h.id !== video.id)].slice(0, 100);

    if (progress > 0 && progress < (video.duration || 1) * 0.92) {
      const cw = data.continueWatching.filter((c) => c.id !== video.id);
      data.continueWatching = [{ ...entry, progress }, ...cw].slice(0, 12);
    } else {
      data.continueWatching = data.continueWatching.filter((c) => c.id !== video.id);
    }

    const cat = video.category;
    const ch = video.channel?.id;
    if (cat) data.signals.categories[cat] = (data.signals.categories[cat] || 0) + 1;
    if (ch) data.signals.channels[ch] = (data.signals.channels[ch] || 0) + 1;
    if (!data.signals.videoIds.includes(video.id)) {
      data.signals.videoIds = [video.id, ...data.signals.videoIds].slice(0, 50);
    }
  });
}

export function isWatchLater(id) {
  return load().watchLater.some((v) => v.id === id);
}

export function toggleWatchLater(video) {
  let added = false;
  mutate((data) => {
    const idx = data.watchLater.findIndex((v) => v.id === video.id);
    if (idx >= 0) {
      data.watchLater.splice(idx, 1);
      added = false;
    } else {
      data.watchLater.unshift({
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        channel: video.channel?.name || "",
        addedAt: new Date().toISOString(),
      });
      added = true;
    }
  });
  return added;
}

export function removeFromHistory(id) {
  mutate((data) => {
    data.history = data.history.filter((h) => h.id !== id);
    data.continueWatching = data.continueWatching.filter((c) => c.id !== id);
  });
}

export function clearHistory() {
  mutate((data) => {
    data.history = [];
    data.continueWatching = [];
  });
}

export function createPlaylist(name) {
  const id = `pl_${Date.now().toString(36)}`;
  mutate((data) => {
    data.playlists.push({ id, name, videoIds: [], createdAt: new Date().toISOString() });
  });
  return id;
}

export function deletePlaylist(id) {
  mutate((data) => {
    data.playlists = data.playlists.filter((p) => p.id !== id);
  });
}

export function addToPlaylist(playlistId, video) {
  mutate((data) => {
    const pl = data.playlists.find((p) => p.id === playlistId);
    if (!pl || pl.videoIds.includes(video.id)) return;
    pl.videoIds.push(video.id);
  });
}

export function removeFromPlaylist(playlistId, videoId) {
  mutate((data) => {
    const pl = data.playlists.find((p) => p.id === playlistId);
    if (pl) pl.videoIds = pl.videoIds.filter((id) => id !== videoId);
  });
}

export function getPlaylist(id) {
  return load().playlists.find((p) => p.id === id);
}
