const {
  selectAllProperties,
  selectPropertyById,
  selectReviewsByPropertyId,
  insertReviewByPropertyId,
  selectUserById,
  deleteReviewById,
} = require("../models/properties.model");

exports.getAllProperties = async (req, res, next) => {
  const {
    sort_by = "property_id",
    order = "asc",
    minprice,
    maxprice,
    property_type,
  } = req.query;

  try {
    const properties = await selectAllProperties(
      sort_by,
      order,
      minprice,
      maxprice,
      property_type
    );
    res.status(200).json({ properties });
  } catch (err) {
    next(err);
  }
};

exports.getPropertyById = async (req, res, next) => {
  const { property_id } = req.params;

  if (isNaN(property_id)) {
    return next({ status: 400, msg: "Invalid property ID" });
  }

  try {
    const property = await selectPropertyById(property_id);
    res.status(200).json({ property });
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByPropertyId = async (req, res, next) => {
  const { property_id } = req.params;

  if (isNaN(property_id)) {
    return next({ status: 400, msg: "Invalid property ID" });
  }

  try {
    const { reviews, average_rating } = await selectReviewsByPropertyId(
      property_id
    );
    res.status(200).json({ reviews, average_rating });
  } catch (err) {
    next(err);
  }
};

exports.postReviewByPropertyId = async (req, res, next) => {
  const { property_id } = req.params;
  const { guest_id, rating, comment } = req.body;

  if (isNaN(property_id)) {
    return res.status(400).json({ msg: "Invalid property ID" });
  }

  if (!guest_id || !rating || !comment) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    const review = await insertReviewByPropertyId(
      property_id,
      guest_id,
      rating,
      comment
    );
    res.status(201).json({ review });
  } catch (err) {
    if (err.status && err.msg) {
      return res.status(err.status).json({ msg: err.msg });
    }

    if (err.code === "22P02") {
      return res.status(400).json({ msg: "Invalid property ID" });
    }

    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.getUserById = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return next({ status: 400, msg: "Invalid user ID" });
  }

  try {
    const user = await selectUserById(id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ msg: "Invalid review ID" });
  }

  try {
    await deleteReviewById(id);
    res.status(204).send();
  } catch (err) {
    if (err.status && err.msg) {
      return res.status(err.status).json({ msg: err.msg });
    }

    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
