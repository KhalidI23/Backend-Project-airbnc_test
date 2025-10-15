const db = require("../db/connection");

exports.selectAllProperties = async () => {
  const { rows } = await db.query(`
    SELECT property_id, host_id, name, location, property_type, price_per_night, description
    FROM properties;
  `);
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
      p.price_per_night,
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
