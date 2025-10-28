const {
  selectAllProperties,
  selectPropertyById,
  selectReviewsByPropertyId,
} = require("../models/properties.model");

exports.getAllProperties = async (req, res, next) => {
  const { sort_by = "property_id", order = "asc" } = req.query;

  try {
    const properties = await selectAllProperties(sort_by, order);
    res.status(200).json({ properties });
  } catch (err) {
    next(err);
  }
};

exports.getPropertyById = async (req, res, next) => {
  const { property_id } = req.params;
  const { user_id } = req.query;

  if (Number.isNaN(Number(property_id))) {
    return next({ status: 400, msg: "Invalid property ID" });
  }

  try {
    const property = await selectPropertyById(property_id);

    if (user_id !== undefined && Number.isNaN(Number(user_id))) {
      return next({ status: 400, msg: "Invalid user ID" });
    }

    res.status(200).json({ property });
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByPropertyId = async (req, res, next) => {
  const { property_id } = req.params;

  if (Number.isNaN(Number(property_id))) {
    return next({ status: 400, msg: "Invalid property ID" });
  }

  try {
    const { reviews, average_rating } = await selectReviewsByPropertyId(
      property_id
    );
    if (!reviews || reviews.length === 0) {
      return next({ status: 404, msg: "Property not found" });
    }

    res.status(200).json({ reviews, average_rating });
  } catch (err) {
    next(err);
  }
};
