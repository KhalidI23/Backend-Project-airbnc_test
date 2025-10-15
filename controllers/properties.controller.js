const {
  selectAllProperties,
  selectPropertyById,
} = require("../models/properties.model");

exports.getAllProperties = async (req, res, next) => {
  try {
    const properties = await selectAllProperties();
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
