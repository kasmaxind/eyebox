const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const ART = "/opt/cursor/artifacts";
const OUT = "/tmp/eyebox-e2e";
fs.mkdirSync(ART, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  // Home
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-brand");
  await page.screenshot({
    path: path.join(ART, "eyebox_home_hero.png"),
    fullPage: false,
  });

  // Browse + genre filter
  await page.click('a.nav-link:has-text("Browse")');
  await page.waitForURL("**/browse");
  await page.waitForSelector(".video-card");
  await page.click('a.chip:has-text("Electronic")');
  await page.waitForURL("**/browse?genre=Electronic");
  await page.screenshot({
    path: path.join(ART, "eyebox_browse_electronic.png"),
    fullPage: false,
  });

  // Watch + play + save
  await page.click(".video-card");
  await page.waitForURL("**/watch/**");
  await page.waitForSelector("video.player-video");
  await page.waitForTimeout(1500);
  const playing = await page.evaluate(() => {
    const v = document.querySelector("video.player-video");
    return !!(v && !v.paused && v.readyState >= 2);
  });
  console.log("video_playing=", playing);
  // Ensure favorited (toggle only if currently unsaved)
  const saveBtn = page.locator('button:has-text("Save"), button:has-text("Saved")').first();
  const label = (await saveBtn.textContent())?.trim();
  if (label !== "Saved") {
    await saveBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(ART, "eyebox_watch_playing_saved.png"),
    fullPage: false,
  });

  // Add to playlist
  await page.click('button:has-text("Add to playlist")');
  await page.click('.playlist-menu__list button:has-text("Evening Drive")');
  await page.waitForSelector(".toast");
  await page.waitForTimeout(500);

  // Search
  await page.fill("#nav-q", "indie");
  await page.press("#nav-q", "Enter");
  await page.waitForURL("**/search?q=indie");
  await page.waitForSelector(".video-card");
  await page.screenshot({
    path: path.join(ART, "eyebox_search_results_indie.png"),
    fullPage: false,
  });

  // Library — expect saved + recent
  await page.goto("http://localhost:3000/library", { waitUntil: "networkidle" });
  await page.waitForSelector("h1:has-text('Library')");
  await page.waitForSelector("text=Neon Tide");
  await page.screenshot({
    path: path.join(ART, "eyebox_library_saved.png"),
    fullPage: false,
  });

  // Playlists
  await page.goto("http://localhost:3000/playlists", { waitUntil: "networkidle" });
  await page.fill('input[aria-label="Playlist name"]', "Night Bus");
  await page.fill(
    'input[aria-label="Playlist description"]',
    "Late rides"
  );
  await page.click('button:has-text("Create")');
  await page.waitForSelector('text=Night Bus');
  await page.screenshot({
    path: path.join(ART, "eyebox_playlists_created.png"),
    fullPage: false,
  });

  await context.close();
  await browser.close();

  // Move recorded video
  const videos = fs.readdirSync(OUT).filter((f) => f.endsWith(".webm"));
  if (videos.length) {
    const src = path.join(OUT, videos[0]);
    const destWebm = path.join(ART, "eyebox_full_app_walkthrough.webm");
    fs.copyFileSync(src, destWebm);
    // Convert to mp4 for broader playback
    const { execSync } = require("child_process");
    execSync(
      `ffmpeg -y -i "${destWebm}" -c:v libx264 -pix_fmt yuv420p -c:a aac "${path.join(ART, "eyebox_full_app_walkthrough.mp4")}"`,
      { stdio: "inherit" }
    );
  }

  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
