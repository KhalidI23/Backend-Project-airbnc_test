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
  const reviewsQuery = `
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

  const { rows } = await db.query(reviewsQuery, [property_id]);

  const propertyCheck = await db.query(
    `SELECT * FROM properties WHERE property_id = $1;`,
    [property_id]
  );

  if (propertyCheck.rowCount === 0) {
    throw { status: 404, msg: "Property not found" };
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
  try {
    // Check property and guest exist first
    const propertyCheck = await db.query(
      `SELECT property_id FROM properties WHERE property_id = $1;`,
      [property_id]
    );
    const guestCheck = await db.query(
      `SELECT user_id FROM users WHERE user_id = $1;`,
      [guest_id]
    );

    if (propertyCheck.rowCount === 0 || guestCheck.rowCount === 0) {
      throw { status: 404, msg: "Property or guest not found" };
    }

    const duplicateCheck = await db.query(
      `SELECT review_id FROM reviews WHERE property_id = $1 AND guest_id = $2;`,
      [property_id, guest_id]
    );

    if (duplicateCheck.rowCount > 0) {
      throw { status: 409, msg: "User has already reviewed this property" };
    }

    const { rows } = await db.query(
      `
      INSERT INTO reviews (property_id, guest_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id, property_id, guest_id, rating, comment, created_at;
      `,
      [property_id, guest_id, rating, comment]
    );

    return rows[0];
  } catch (err) {
    if (err.code === "22P02") {
      throw { status: 400, msg: "Invalid property ID" };
    }
    throw err;
  }
};

exports.selectUserById = async (user_id) => {
  const { rows } = await db.query(
    `
    SELECT 
      user_id,
      first_name,
      surname,
      email,
      phone_number,
      avatar,
      created_at
    FROM users
    WHERE user_id = $1;
    `,
    [user_id]
  );

  if (rows.length === 0) {
    throw { status: 404, msg: "User not found" };
  }

  return rows[0];
};

exports.deleteReviewById = async (review_id) => {
  const result = await db.query(
    `DELETE FROM reviews WHERE review_id = $1 RETURNING *;`,
    [review_id]
  );

  if (result.rowCount === 0) {
    throw { status: 404, msg: "Review not found" };
  }

  return;
};
