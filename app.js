const express = require("express");
const app = express();
const db = require("./db/connection");

app.use(express.json());

app.get("/api/properties", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM properties;");
    res.status(200).json({ properties: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = app;
