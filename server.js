const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const cron = require("node-cron");

const app = express();
const PORT = 3000; // Change this if needed
const CACHE_DIR = "./rss-cache";

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

// Load feeds from configuration file
const feeds = JSON.parse(fs.readFileSync("feeds.json")).feeds;

// Fetch and cache all RSS feeds
async function fetchRSS() {
  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url);
      if (!response.ok)
        throw new Error(`Failed to fetch RSS: ${response.statusText}`);

      const rssText = await response.text();
      fs.writeFileSync(`${CACHE_DIR}/${feed.name}.xml`, rssText);
      console.log(
        `[INFO] Cached ${feed.name} RSS at ${new Date().toISOString()}`
      );
    } catch (error) {
      console.error(
        `[ERROR] Failed to update ${feed.name} RSS feed: ${error.message}`
      );
    }
  }
}

// Serve cached RSS dynamically
app.get("/rss/:feedName", (req, res) => {
  const { feedName } = req.params;
  const filePath = `${CACHE_DIR}/${feedName}.xml`;

  if (fs.existsSync(filePath)) {
    res.set("Content-Type", "application/xml");
    res.send(fs.readFileSync(filePath));
  } else {
    res.status(404).send("RSS Feed not found");
  }
});

// Run RSS fetch every 5 minutes
cron.schedule("*/5 * * * *", fetchRSS);

// Fetch RSS once on startup
fetchRSS();

// Start server
app.listen(PORT, () =>
  console.log(`RSS Proxy running at http://localhost:${PORT}/rss/:feedName`)
);
