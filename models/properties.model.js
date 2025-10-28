const db = require("../db/connection");

exports.selectAllProperties = async (
  sort_by = "property_id",
  order = "asc"
) => {
  const validColumns = [
    "property_id",
    "host_id",
    "name",
    "location",
    "property_type",
    "price_per_night",
    "description",
  ];
  const validOrders = ["asc", "desc"];

  if (!validColumns.includes(sort_by)) {
    throw { status: 400, msg: "Invalid sort" };
  }
  if (!validOrders.includes(order.toLowerCase())) {
    throw { status: 400, msg: "Invalid order" };
  }

  const queryStr = `
    SELECT 
      property_id, 
      host_id, 
      name, 
      location, 
      property_type, 
      price_per_night::FLOAT AS price_per_night, 
      description
    FROM properties
    ORDER BY ${sort_by} ${order.toUpperCase()};
  `;

  const { rows } = await db.query(queryStr);
  return rows;
};

exports.selectPropertyById = async (property_id) => {
  const { rows } = await db.query(
    `
    SELECT 
      p.property_id,
      p.name AS property_name,
      p.location,
      p.property_type,
      p.price_per_night::FLOAT AS price_per_night,
      p.description,
      p.host_id
    FROM properties p
    WHERE p.property_id = $1;
    `,
    [property_id]
  );

  if (rows.length === 0) {
    throw { status: 404, msg: "Property not found" };
  }

  return rows[0];
};

exports.selectReviewsByPropertyId = async (property_id) => {
  const queryStr = `
    SELECT 
      r.review_id,
      r.comment,
      r.rating,
      r.created_at,
      CONCAT(u.first_name, ' ', u.surname) AS guest,
      u.avatar AS guest_avatar
    FROM reviews r
    JOIN users u ON r.guest_id = u.user_id
    WHERE r.property_id = $1
    ORDER BY r.created_at DESC;
  `;

  const { rows } = await db.query(queryStr, [property_id]);

  if (rows.length === 0) {
    const propertyCheck = await db.query(
      `SELECT * FROM properties WHERE property_id = $1;`,
      [property_id]
    );
    if (propertyCheck.rows.length === 0) {
      throw { status: 404, msg: "Property not found" };
    }
  }

  const average_rating =
    rows.length === 0
      ? 0
      : Number(
          (
            rows.reduce((acc, curr) => acc + Number(curr.rating), 0) /
            rows.length
          ).toFixed(2)
        );

  return { reviews: rows, average_rating };
};

exports.insertReviewByPropertyId = async (
  property_id,
  guest_id,
  rating,
  comment
) => {
  const queryStr = `
    INSERT INTO reviews (property_id, guest_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING review_id, property_id, guest_id, rating, comment, created_at;
  `;

  try {
    const { rows } = await db.query(queryStr, [
      property_id,
      guest_id,
      rating,
      comment,
    ]);

    if (rows.length === 0) {
      throw { status: 404, msg: "Property not found" };
    }

    return rows[0];
  } catch (err) {
    if (err.code === "23503") {
      throw { status: 404, msg: "Property or guest not found" };
    }
    throw err;
  }
};
