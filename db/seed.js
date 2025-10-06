const db = require("./connection.js");
const format = require("pg-format");
const { createUserRef, formatProperties } = require("./utils");

async function seed(propertyTypes, users, reviews, properties) {
  try {
    await db.query(`DROP TABLE IF EXISTS reviews;`);
    await db.query(`DROP TABLE IF EXISTS properties;`);
    await db.query(`DROP TABLE IF EXISTS property_types;`);
    await db.query(`DROP TABLE IF EXISTS users;`);

    await db.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        first_name VARCHAR NOT NULL,
        surname VARCHAR NOT NULL,
        email VARCHAR NOT NULL UNIQUE,
        phone_number VARCHAR,
        is_host BOOLEAN NOT NULL DEFAULT FALSE,
        avatar VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE property_types (
        property_type VARCHAR PRIMARY KEY,
        description   TEXT NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE properties (
        property_id     SERIAL PRIMARY KEY,
        host_id         INT NOT NULL REFERENCES users(user_id),
        name            VARCHAR NOT NULL,
        location        VARCHAR NOT NULL,
        property_type   VARCHAR NOT NULL REFERENCES property_types(property_type),
        price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
        description     TEXT
      );
    `);

    await db.query(`
      CREATE TABLE reviews (
        review_id   SERIAL PRIMARY KEY,
        property_id INT NOT NULL REFERENCES properties(property_id),
        guest_id    INT NOT NULL REFERENCES users(user_id),
        rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE (property_id, guest_id)
      );
    `);

    await db.query(
      format(
        "INSERT INTO property_types (property_type, description) VALUES %L;",
        propertyTypes.map(({ property_type, description }) => [
          property_type,
          description,
        ])
      )
    );

    const { rows: insertedUsers } = await db.query(
      format(
        `INSERT INTO users (first_name, surname, email, phone_number, is_host, avatar)
         VALUES %L
         RETURNING user_id, first_name, surname;`,
        users.map(
          ({ first_name, surname, email, phone_number, is_host, avatar }) => [
            first_name,
            surname,
            email,
            phone_number,
            is_host,
            avatar,
          ]
        )
      )
    );

    const userRef = createUserRef(insertedUsers);
    const formattedProps = formatProperties(properties, userRef);

    await db.query(
      format(
        `INSERT INTO properties
         (host_id, name, location, property_type, price_per_night, description)
         VALUES %L;`,
        formattedProps
      )
    );
  } catch (err) {
  } finally {
    await db.end();
  }
}

module.exports = seed;
