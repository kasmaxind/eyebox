import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Channel } from '../models/Channel';
import { Category } from '../models/Category';
import { Video } from '../models/Video';
import { hashPassword } from '../utils/password';
import { createSlug, createHandle } from '../utils/slug';

const CATEGORIES = [
  { name: 'Music', slug: 'music', icon: '🎵', color: '#e91e63', order: 1 },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', color: '#9c27b0', order: 2 },
  { name: 'Movies', slug: 'movies', icon: '🎬', color: '#673ab7', order: 3 },
  { name: 'Education', slug: 'education', icon: '📚', color: '#3f51b5', order: 4 },
  { name: 'Sports', slug: 'sports', icon: '⚽', color: '#2196f3', order: 5 },
  { name: 'News', slug: 'news', icon: '📰', color: '#03a9f4', order: 6 },
  { name: 'Tech', slug: 'tech', icon: '💻', color: '#00bcd4', order: 7 },
  { name: 'Entertainment', slug: 'entertainment', icon: '🎭', color: '#009688', order: 8 },
  { name: 'Travel', slug: 'travel', icon: '✈️', color: '#4caf50', order: 9 },
  { name: 'Comedy', slug: 'comedy', icon: '😂', color: '#8bc34a', order: 10 },
];

const PLACEHOLDER_THUMBNAIL = 'https://placehold.co/1280x720/1a1a2e/eee?text=EYEBOX+TUBE.AI';

const SAMPLE_VIDEOS = [
  { title: 'Welcome to EYEBOX TUBE.AI', description: 'Discover the future of AI-powered video streaming.', tags: ['welcome', 'intro', 'eyebox'], category: 'tech' },
  { title: 'Top 10 Gaming Moments 2026', description: 'The best gaming highlights of the year.', tags: ['gaming', 'highlights', 'esports'], category: 'gaming' },
  { title: 'Learn TypeScript in 30 Minutes', description: 'A quick crash course on TypeScript fundamentals.', tags: ['typescript', 'programming', 'tutorial'], category: 'education' },
  { title: 'Epic Music Mix - Chill Vibes', description: 'Relax and unwind with this curated music mix.', tags: ['music', 'chill', 'mix'], category: 'music' },
  { title: 'Comedy Sketches That Will Make You Laugh', description: 'The funniest comedy sketches on the platform.', tags: ['comedy', 'funny', 'sketch'], category: 'comedy' },
  { title: 'Travel Guide: Hidden Gems in Japan', description: 'Explore off-the-beaten-path destinations in Japan.', tags: ['travel', 'japan', 'guide'], category: 'travel' },
  { title: 'Sports Highlights: Championship Finals', description: 'Relive the most exciting moments from the finals.', tags: ['sports', 'finals', 'highlights'], category: 'sports' },
  { title: 'Tech News: AI Revolution 2026', description: 'Breaking news on the latest AI developments.', tags: ['tech', 'ai', 'news'], category: 'tech' },
];

async function seed(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected.');

  // Seed categories
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  const categories = await Category.find();
  const categoryMap = new Map(categories.map((c) => [c.slug, c._id]));

  // Seed admin user
  console.log('Seeding admin user...');
  const adminPasswordHash = await hashPassword(env.ADMIN_PASSWORD);
  let admin = await User.findOne({ email: env.ADMIN_EMAIL });

  if (!admin) {
    admin = await User.create({
      email: env.ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      name: env.ADMIN_NAME,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`Admin created: ${env.ADMIN_EMAIL}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  let adminChannel = await Channel.findOne({ owner: admin._id });
  if (!adminChannel) {
    adminChannel = await Channel.create({
      owner: admin._id,
      name: 'EYEBOX Official',
      handle: 'eyebox-official',
      description: 'Official EYEBOX TUBE.AI channel',
      verified: true,
      logo: PLACEHOLDER_THUMBNAIL,
      banner: PLACEHOLDER_THUMBNAIL,
    });
  }

  // Seed demo creator
  console.log('Seeding demo creator...');
  let creator = await User.findOne({ email: 'creator@eyebox.ai' });
  if (!creator) {
    creator = await User.create({
      email: 'creator@eyebox.ai',
      passwordHash: await hashPassword('Creator@Eyebox2026!'),
      name: 'Demo Creator',
      role: 'creator',
      isEmailVerified: true,
    });
  }

  let creatorChannel = await Channel.findOne({ owner: creator._id });
  if (!creatorChannel) {
    creatorChannel = await Channel.create({
      owner: creator._id,
      name: 'Demo Creator Channel',
      handle: createHandle('Demo Creator'),
      description: 'A demo channel with sample content for local development.',
      verified: false,
      logo: PLACEHOLDER_THUMBNAIL,
    });
  }

  // Seed sample videos
  console.log('Seeding sample videos...');
  for (const sample of SAMPLE_VIDEOS) {
    const slug = createSlug(sample.title);
    const existing = await Video.findOne({ slug });
    if (existing) continue;

    const categoryId = categoryMap.get(sample.category);
    await Video.create({
      channel: creatorChannel._id,
      uploader: creator._id,
      title: sample.title,
      description: sample.description,
      slug,
      tags: sample.tags,
      category: categoryId,
      visibility: 'public',
      status: 'ready',
      duration: Math.floor(Math.random() * 600) + 120,
      views: Math.floor(Math.random() * 50000) + 100,
      likes: Math.floor(Math.random() * 1000),
      thumbnails: [{ url: PLACEHOLDER_THUMBNAIL, isAuto: true, isSelected: true }],
      videoFiles: [
        { quality: 720, url: PLACEHOLDER_THUMBNAIL, width: 1280, height: 720, codec: 'h264' },
        { quality: 1080, url: PLACEHOLDER_THUMBNAIL, width: 1920, height: 1080, codec: 'h264' },
      ],
      aiSummary: sample.description,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      allowComments: true,
    });
  }

  const videoCount = await Video.countDocuments({ channel: creatorChannel._id });
  await Channel.updateOne({ _id: creatorChannel._id }, { videoCount });

  console.log('Seed completed successfully!');
  console.log(`Admin login: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  console.log('Creator login: creator@eyebox.ai / Creator@Eyebox2026!');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
