const fs = require("fs");
const csv = require("fast-csv");

const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const router = new express.Router();
const quotes = [];

router.get("/status", function (req, res) {
  res.json({
    message: "Node quote v2 initialized with " + quotes.length + " quotes.",
  });
});

router.get("/", function (req, res) {
  let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  randomQuote.version = 'V3'
  res.json(randomQuote);
});

app.use("/", router);

app.listen(port);

fs.createReadStream("quotes.csv")
  .pipe(csv.parse({ headers: ["id", "content", "author"] }))
  .on("data", function (data) {
    quotes.push(data);
  })
  .on("end", function () {
    console.log("Finished loading quotes from file");
  });

console.log("Node Quote RESTful API server started on: " + port);
