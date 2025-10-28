const express = require("express");
const app = express();

const {
  getAllProperties,
  getPropertyById,
  getReviewsByPropertyId,
  postReviewByPropertyId,
} = require("./controllers/properties.controller");

app.use(express.json());

app.get("/api/properties", getAllProperties);
app.get("/api/properties/:property_id", getPropertyById);
app.get("/api/properties/:property_id/reviews", getReviewsByPropertyId);
app.post("/api/properties/:property_id/reviews", postReviewByPropertyId);

// Error handlers
app.use((err, req, res, next) => {
  if (err && err.status && err.msg) {
    return res.status(err.status).json({ msg: err.msg });
  }
  if (err && err.code === "22P02") {
    return res.status(400).json({ msg: "Bad Request" });
  }
  console.error(err);
  return res.status(500).json({ msg: "Internal Server Error" });
});

module.exports = app;
