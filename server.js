const express = require("express");
const axios = require("axios"); // Using axios instead of node-fetch
const fs = require("fs").promises;
const path = require("path");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_DIR = "./rss-cache";

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

// Load feeds from configuration file
async function loadFeeds() {
  try {
    const data = await fs.readFile("feeds.json", "utf8");
    return JSON.parse(data).feeds;
  } catch (err) {
    console.error(`[ERROR] Failed to load feeds.json: ${err.message}`);
    throw err;
  }
}

// Fetch and cache a single RSS feed
async function fetchRSSFeed(feed) {
  try {
    const response = await axios.get(feed.url, {
      responseType: "text",
      headers: {
        "User-Agent": "RSS-Proxy/1.0",
      },
    });

    await fs.writeFile(path.join(CACHE_DIR, `${feed.name}.xml`), response.data);
    console.log(
      `[INFO] Cached ${feed.name} RSS at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error(
      `[ERROR] Failed to update ${feed.name} RSS feed: ${error.message}`
    );
  }
}

// Fetch all RSS feeds in parallel
async function fetchAllRSS(feeds) {
  console.log(
    `[INFO] Starting RSS feeds update at ${new Date().toISOString()}`
  );
  const promises = feeds.map((feed) => fetchRSSFeed(feed));
  await Promise.allSettled(promises);
}

// Initialize and start the server
async function startServer() {
  try {
    // Setup cache directory
    await ensureCacheDir();

    // Load feed configuration
    const feeds = await loadFeeds();

    // Serve cached RSS dynamically
    app.get("/rss/:feedName", async (req, res) => {
      const { feedName } = req.params;

      // Simple validation to prevent path traversal
      if (!feedName || feedName.includes("/") || feedName.includes("\\")) {
        return res.status(400).send("Invalid feed name");
      }

      const filePath = path.join(CACHE_DIR, `${feedName}.xml`);

      try {
        const data = await fs.readFile(filePath);

        // Set appropriate headers
        res.set("Content-Type", "application/xml");
        res.send(data);
      } catch (err) {
        if (err.code === "ENOENT") {
          res.status(404).send("RSS Feed not found");
        } else {
          console.error(`[ERROR] Failed to serve ${feedName}: ${err.message}`);
          res.status(500).send("Internal Server Error");
        }
      }
    });

    // Run RSS fetch every 5 minutes
    cron.schedule("*/5 * * * *", () => fetchAllRSS(feeds));

    // Fetch RSS once on startup
    await fetchAllRSS(feeds);

    // Start server
    app.listen(PORT, () =>
      console.log(`RSS Proxy running at http://localhost:${PORT}/rss/:feedName`)
    );
  } catch (err) {
    console.error(`[FATAL] Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

// Start everything
startServer();
