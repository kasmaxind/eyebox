import { Router } from "express";
import { db } from "./db.js";
import { rankTrending, rankVideos } from "./recommendations.js";

const router = Router();

const videoSelect = `
  SELECT v.*,
    c.name AS channel_name,
    c.handle AS channel_handle,
    c.avatar_color AS avatar_color,
    c.subscribers AS subscribers
  FROM videos v
  JOIN channels c ON c.id = v.channel_id
`;

export function mapVideo(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    views: row.views,
    likes: row.likes,
    category: row.category,
    isShort: row.duration > 0 && row.duration <= 60,
    createdAt: row.created_at,
    streamUrl: `/api/stream/${row.id}`,
    thumbnailUrl: row.thumbnail ? `/api/thumbs/${row.thumbnail}` : null,
    channel: {
      id: row.channel_id,
      name: row.channel_name,
      handle: row.channel_handle,
      avatarColor: row.avatar_color,
      subscribers: row.subscribers,
    },
  };
}

function allVideos() {
  return db.prepare(`${videoSelect} ORDER BY v.created_at DESC`).all();
}

function buildVideoFilters(query) {
  let where = "WHERE 1=1";
  const params = [];

  const q = (query.q || "").toString().trim();
  const category = (query.category || "").toString().trim();
  const channel = (query.channel || "").toString().trim();
  const type = (query.type || "").toString();
  const uploadDate = (query.uploadDate || "").toString();
  const duration = (query.duration || "").toString();
  const sort = (query.sort || "latest").toString();

  if (q) {
    where += " AND (v.title LIKE ? OR v.description LIKE ? OR c.name LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (category && category !== "All") {
    where += " AND v.category = ?";
    params.push(category);
  }
  if (channel) {
    where += " AND c.handle = ?";
    params.push(channel);
  }
  if (type === "short") {
    where += " AND v.duration > 0 AND v.duration <= 60";
  } else if (type === "long") {
    where += " AND v.duration > 60";
  }
  if (uploadDate === "week") {
    where += " AND v.created_at >= datetime('now', '-7 days')";
  } else if (uploadDate === "month") {
    where += " AND v.created_at >= datetime('now', '-30 days')";
  } else if (uploadDate === "year") {
    where += " AND v.created_at >= datetime('now', '-365 days')";
  }
  if (duration === "short") {
    where += " AND v.duration > 0 AND v.duration < 240";
  } else if (duration === "medium") {
    where += " AND v.duration >= 240 AND v.duration < 1200";
  } else if (duration === "long") {
    where += " AND v.duration >= 1200";
  }

  const order =
    sort === "popular" || sort === "trending"
      ? "ORDER BY v.views DESC, v.likes DESC, v.created_at DESC"
      : sort === "liked"
        ? "ORDER BY v.likes DESC, v.created_at DESC"
        : "ORDER BY v.created_at DESC";

  return { where, params, order };
}

router.get("/trending", (_req, res) => {
  const rows = rankTrending(allVideos(), 24);
  res.json({ videos: rows.map(mapVideo) });
});

router.get("/explore", (_req, res) => {
  const categories = db
    .prepare("SELECT DISTINCT category FROM videos ORDER BY category ASC")
    .all()
    .map((r) => r.category);

  const sections = categories.map((category) => {
    const rows = db
      .prepare(`${videoSelect} WHERE v.category = ? ORDER BY v.views DESC LIMIT 8`)
      .all(category);
    return { category, videos: rows.map(mapVideo) };
  });

  res.json({ categories: ["All", ...categories], sections });
});

router.get("/shorts", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "24", 10) || 24, 48);
  const rows = db
    .prepare(`${videoSelect} WHERE v.duration > 0 AND v.duration <= 60 ORDER BY v.views DESC LIMIT ?`)
    .all(limit);
  res.json({ videos: rows.map(mapVideo) });
});

router.post("/personalized", (req, res) => {
  const { categories = [], channels = [], videoIds = [], excludeIds = [] } = req.body || {};
  const all = allVideos();
  const seedVideos = all.filter((v) => videoIds.includes(v.id));
  const ranked = rankVideos(all, {
    seedVideos,
    preferredCategories: categories,
    preferredChannels: channels,
    excludeIds: [...excludeIds, ...videoIds.slice(0, 3)],
  }, 16);
  res.json({ videos: ranked.map(mapVideo), poweredBy: "eyebox-ai" });
});

router.get("/recommendations", (req, res) => {
  const forId = (req.query.for || "").toString();
  const limit = Math.min(parseInt(req.query.limit || "12", 10) || 12, 24);
  const all = allVideos();

  if (forId) {
    const seed = all.find((v) => v.id === forId);
    if (!seed) return res.json({ videos: [] });
    const ranked = rankVideos(all, { seedVideos: [seed], excludeIds: [forId] }, limit);
    return res.json({ videos: ranked.map(mapVideo), poweredBy: "eyebox-ai" });
  }

  const ranked = rankTrending(all, limit);
  res.json({ videos: ranked.map(mapVideo), poweredBy: "eyebox-ai" });
});

router.get("/home", (req, res) => {
  const all = allVideos();
  const trending = rankTrending(all, 8).map(mapVideo);
  const latest = all.slice(0, 8).map(mapVideo);
  const shorts = db
    .prepare(`${videoSelect} WHERE v.duration > 0 AND v.duration <= 60 ORDER BY v.likes DESC LIMIT 8`)
    .all()
    .map(mapVideo);

  res.json({
    sections: [
      { id: "trending", title: "Trending now", videos: trending },
      { id: "latest", title: "Latest uploads", videos: latest },
      { id: "shorts", title: "Shorts", videos: shorts, href: "/shorts" },
    ],
  });
});

router.post("/home", (req, res) => {
  const { categories = [], channels = [], videoIds = [], continueIds = [], watchLaterIds = [] } =
    req.body || {};
  const all = allVideos();

  const continueVideos = continueIds
    .map((id) => all.find((v) => v.id === id))
    .filter(Boolean)
    .map(mapVideo);

  const personalized = rankVideos(all, {
    seedVideos: all.filter((v) => videoIds.includes(v.id)),
    preferredCategories: categories,
    preferredChannels: channels,
    excludeIds: videoIds.slice(0, 5),
  }, 12).map(mapVideo);

  const recommended = rankVideos(all, {
    seedVideos: all.filter((v) => videoIds.slice(0, 3).includes(v.id)),
    preferredCategories: categories,
    excludeIds: [...videoIds, ...watchLaterIds],
  }, 12).map(mapVideo);

  const trending = rankTrending(all, 8).map(mapVideo);
  const shorts = db
    .prepare(`${videoSelect} WHERE v.duration > 0 AND v.duration <= 60 ORDER BY v.views DESC LIMIT 10`)
    .all()
    .map(mapVideo);

  const sections = [];
  if (continueVideos.length) {
    sections.push({ id: "continue", title: "Continue watching", videos: continueVideos });
  }
  if (personalized.length) {
    sections.push({
      id: "personalized",
      title: "Recommended for you",
      videos: personalized,
      badge: "AI",
    });
  }
  sections.push({ id: "trending", title: "Trending", videos: trending, href: "/explore" });
  if (recommended.length) {
    sections.push({ id: "recommended", title: "More you might like", videos: recommended, badge: "AI" });
  }
  sections.push({ id: "shorts", title: "Shorts", videos: shorts, href: "/shorts" });

  res.json({ sections, poweredBy: "eyebox-ai" });
});

router.get("/search", (req, res) => {
  const { where, params, order } = buildVideoFilters(req.query);
  const limit = Math.min(parseInt(req.query.limit || "48", 10) || 48, 100);
  const rows = db.prepare(`${videoSelect} ${where} ${order} LIMIT ?`).all(...params, limit);
  const facets = {
    categories: db.prepare("SELECT DISTINCT category FROM videos ORDER BY category").all().map((r) => r.category),
    types: ["short", "long"],
    uploadDates: ["week", "month", "year"],
    durations: ["short", "medium", "long"],
    sorts: ["latest", "popular", "liked", "trending"],
  };
  res.json({ videos: rows.map(mapVideo), facets, query: req.query });
});

export { buildVideoFilters, videoSelect };
export default router;
