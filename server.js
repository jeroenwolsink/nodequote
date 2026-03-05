const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const express = require("express");

const app = express();
const port = process.env.PORT || 8080;
const router = express.Router();
const quotes = [];

app.use("/ui", express.static(path.join(__dirname, "public")));

app.get("/ui", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health / status endpoint
router.get("/status", (req, res) => {
  res.json({
    status: quotes.length > 0 ? "ready" : "loading",
    message: `Node quote service initialized with ${quotes.length} quotes.`,
  });
});

// Random quote endpoint
router.get("/", (req, res) => {
  if (quotes.length === 0) {
    return res.status(503).json({ error: "Quotes not loaded yet" });
  }
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ ...randomQuote, version: "V4" });
});

app.use("/", router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

/**
 * Load quotes from CSV file.
 * Returns a promise that resolves when all quotes are loaded.
 */
function loadQuotes() {
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, "quotes.csv");
    fs.createReadStream(csvPath)
      .pipe(csv.parse({ headers: ["id", "content", "author"] }))
      .on("data", (data) => {
        quotes.push(data);
      })
      .on("end", () => {
        console.log(`Finished loading ${quotes.length} quotes from file`);
        resolve(quotes);
      })
      .on("error", (err) => {
        console.error("Failed to load quotes:", err.message);
        reject(err);
      });
  });
}

// Start the server only when run directly (not when imported by tests)
if (require.main === module) {
  loadQuotes()
    .then(() => {
      app.listen(port, () => {
        console.log(`Node Quote RESTful API server started on port ${port}`);
      });
    })
    .catch(() => {
      process.exit(1);
    });
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

module.exports = { app, quotes, loadQuotes };
