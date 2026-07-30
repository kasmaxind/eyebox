/**
 * Content-based recommendation scoring (local "AI" — no external API).
 * Ranks videos by category/channel affinity, watch patterns, popularity, and recency.
 */

function recencyScore(createdAt) {
  const t = new Date(createdAt.includes("T") ? createdAt : createdAt.replace(" ", "T") + "Z").getTime();
  const days = (Date.now() - t) / 86400000;
  return Math.max(0, 1 - days / 90);
}

function popularityScore(views, likes) {
  return Math.log10(views + 1) * 0.6 + Math.log10(likes + 1) * 0.4;
}

function titleSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  if (!wordsA.size || !wordsB.size) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.max(wordsA.size, wordsB.size);
}

export function scoreVideo(video, context = {}) {
  const {
    seedVideos = [],
    preferredCategories = [],
    preferredChannels = [],
    excludeIds = new Set(),
    boostShorts = false,
  } = context;

  if (excludeIds.has(video.id)) return -1;

  let score = popularityScore(video.views, video.likes) + recencyScore(video.created_at) * 2;

  if (preferredCategories.includes(video.category)) score += 3;
  if (preferredChannels.includes(video.channel_id)) score += 2.5;

  for (const seed of seedVideos) {
    if (seed.id === video.id) continue;
    if (seed.category === video.category) score += 1.5;
    if (seed.channel_id === video.channel_id) score += 2;
    score += titleSimilarity(seed.title, video.title) * 2;
  }

  if (boostShorts && video.duration <= 60) score += 1.2;
  if (!boostShorts && video.duration > 60) score += 0.3;

  return score;
}

export function rankVideos(rows, context = {}, limit = 12) {
  const excludeIds = new Set(context.excludeIds || []);
  return rows
    .map((row) => ({ row, score: scoreVideo(row, { ...context, excludeIds }) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
}

export function trendingScore(video) {
  const recency = recencyScore(video.created_at);
  const velocity = Math.log10(video.views + 1) + Math.log10(video.likes + 1) * 1.5;
  return velocity * (0.5 + recency);
}

export function rankTrending(rows, limit = 24) {
  return rows
    .map((row) => ({ row, score: trendingScore(row) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
}
