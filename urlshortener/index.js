require("dotenv").config();
const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));
const hash = {};
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  dns.lookup(req.body.url.replace("https://www.", ""), (err, address) => {
    if (!req.body.url.includes("https://www.") || err) {
      res.json({ error: "invalid url" });
    } else {
      const shortURLNumber = Math.floor(
        Math.random() * req.body.url.length * req.body.url.length
      );
      res.json({ original_url: req.body.url, short_url: shortURLNumber });
      hash[shortURLNumber] = req.body.url;
    }
  });
});

app.get("/api/shorturl/:shortURLNumber", (req, res) => {
  res.redirect(hash[req.params.shortURLNumber]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
