require("jest-sorted");
const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection");

describe("app", () => {
  describe("/api/properties", () => {
    describe("GET", () => {
      test("responds with status of 200", async () => {
        await request(app).get("/api/properties").expect(200);
      });

      test("returns object with key of properties", async () => {
        const { body } = await request(app).get("/api/properties");
        expect(body).toHaveProperty("properties");
      });

      test("the value of 'properties' is an array", async () => {
        const { body } = await request(app).get("/api/properties");
        expect(Array.isArray(body.properties)).toBe(true);
      });

      test("the number of properties is 11", async () => {
        const { body } = await request(app).get("/api/properties");
        expect(body.properties.length).toBe(11);
      });

      test("each property has expected key", async () => {
        const { body } = await request(app).get("/api/properties");
        body.properties.forEach((property) => {
          expect(property).toEqual(
            expect.objectContaining({
              property_id: expect.any(Number),
              host_id: expect.any(Number),
              name: expect.any(String),
              location: expect.any(String),
              property_type: expect.any(String),
              price_per_night: expect.any(Number),
              description: expect.any(String),
            })
          );
        });
      });
    });
  });

  describe("/api/properties/:property_id", () => {
    describe("GET", () => {
      test("200: responds with a single property object containing expected keys", async () => {
        const { body, status } = await request(app).get("/api/properties/1");
        expect(status).toBe(200);
        expect(body).toHaveProperty("property");
        expect(body.property).toEqual(
          expect.objectContaining({
            property_id: expect.any(Number),
            property_name: expect.any(String),
            location: expect.any(String),
            property_type: expect.any(String),
            price_per_night: expect.any(Number),
            description: expect.any(String),
            host_id: expect.any(Number),
          })
        );
      });

      test("404: responds with a not found message when property_id does not exist", async () => {
        const { body, status } = await request(app).get(
          "/api/properties/999999"
        );
        expect(status).toBe(404);
        expect(body).toEqual({ msg: "Property not found" });
      });

      test("400: responds with bad request for invalid property_id type", async () => {
        const { body, status } = await request(app).get(
          "/api/properties/invalid number"
        );
        expect(status).toBe(400);
        expect(body).toEqual({ msg: "Invalid property ID" });
      });
    });
  });

  describe("/api/properties (sorting)", () => {
    test("200: returns properties sorted by price_per_night ascending by default", async () => {
      const { body } = await request(app).get(
        "/api/properties?sort_by=price_per_night"
      );
      expect(body.properties).toBeSortedBy("price_per_night", {
        ascending: true,
      });
    });

    test("200: returns properties sorted by price_per_night descending when order=desc", async () => {
      const { body } = await request(app).get(
        "/api/properties?sort_by=price_per_night&order=desc"
      );
      expect(body.properties).toBeSortedBy("price_per_night", {
        descending: true,
      });
    });

    test("400: responds with 'Invalid sort' for bad sort_by value", async () => {
      const { body, status } = await request(app).get(
        "/api/properties?sort_by=not_a_column"
      );
      expect(status).toBe(400);
      expect(body.msg).toBe("Invalid sort");
    });

    test("400: responds with 'Invalid order' for bad order value", async () => {
      const { body, status } = await request(app).get(
        "/api/properties?order=sideways"
      );
      expect(status).toBe(400);
      expect(body.msg).toBe("Invalid order");
    });
  });

  describe("/api/properties/:property_id/reviews", () => {
    describe("GET", () => {
      test("200: responds with reviews for the given property, sorted by date desc", async () => {
        const { body, status } = await request(app).get(
          "/api/properties/1/reviews"
        );
        expect(status).toBe(200);
        expect(Array.isArray(body.reviews)).toBe(true);
        body.reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              review_id: expect.any(Number),
              comment: expect.any(String),
              rating: expect.any(Number),
              created_at: expect.any(String),
              guest: expect.any(String),
              guest_avatar: expect.any(String),
            })
          );
        });
        expect(body.reviews).toBeSortedBy("created_at", { descending: true });
        expect(typeof body.average_rating).toBe("number");
      });

      test("404: responds with not found if property_id does not exist", async () => {
        const { body, status } = await request(app).get(
          "/api/properties/9999/reviews"
        );
        expect(status).toBe(404);
        expect(body).toEqual({ msg: "Property not found" });
      });

      test("400: responds with bad request for invalid property_id type", async () => {
        const { body, status } = await request(app).get(
          "/api/properties/invalid/reviews"
        );
        expect(status).toBe(400);
        expect(body).toEqual({ msg: "Invalid property ID" });
      });
    });

    describe("POST", () => {
      test("201: inserts a new review and responds with the created review object", async () => {
        const newReview = {
          guest_id: 4,
          rating: 5,
          comment: "Lovely property!",
        };

        const { body, status } = await request(app)
          .post("/api/properties/2/reviews")
          .send(newReview);

        expect(status).toBe(201);
        expect(body).toHaveProperty("review");
        expect(body.review).toEqual(
          expect.objectContaining({
            review_id: expect.any(Number),
            property_id: 2,
            guest_id: 4,
            rating: 5,
            comment: "Lovely property!",
            created_at: expect.any(String),
          })
        );
      });

      test("400: responds with error when missing required fields", async () => {
        const { body, status } = await request(app)
          .post("/api/properties/1/reviews")
          .send({ guest_id: 1, rating: 5 });

        expect(status).toBe(400);
        expect(body).toEqual({ msg: "Missing required fields" });
      });

      test("409: responds with conflict if user has already reviewed the property", async () => {
        const duplicateReview = {
          guest_id: 4,
          rating: 4,
          comment: "Trying to review again!",
        };

        const { body, status } = await request(app)
          .post("/api/properties/2/reviews")
          .send(duplicateReview);

        expect(status).toBe(409);
        expect(body).toEqual({
          msg: "User has already reviewed this property",
        });
      });

      test("404: responds with not found if property does not exist", async () => {
        const newReview = {
          guest_id: 3,
          rating: 4,
          comment: "Doesn't matter",
        };

        const { body, status } = await request(app)
          .post("/api/properties/9999/reviews")
          .send(newReview);

        expect(status).toBe(404);
        expect(body).toEqual({ msg: "Property or guest not found" });
      });

      test("400: responds with bad request for invalid property_id", async () => {
        const newReview = {
          guest_id: 3,
          rating: 4,
          comment: "Invalid test",
        };

        const { body, status } = await request(app)
          .post("/api/properties/not-a-number/reviews")
          .send(newReview);

        expect(status).toBe(400);
        expect(body).toEqual({ msg: "Invalid property ID" });
      });
    });
  });

  describe("/api/users/:id", () => {
    test("200: responds with a single user object with expected keys", async () => {
      const { body, status } = await request(app).get("/api/users/1");
      expect(status).toBe(200);
      expect(body.user).toEqual(
        expect.objectContaining({
          user_id: expect.any(Number),
          first_name: expect.any(String),
          surname: expect.any(String),
          email: expect.any(String),
          phone_number: expect.any(String),
          avatar: expect.any(String),
          created_at: expect.any(String),
        })
      );
    });

    test("404: responds with not found when user does not exist", async () => {
      const { body, status } = await request(app).get("/api/users/999999");
      expect(status).toBe(404);
      expect(body).toEqual({ msg: "User not found" });
    });

    test("400: responds with bad request for invalid id type", async () => {
      const { body, status } = await request(app).get(
        "/api/users/not-a-number"
      );
      expect(status).toBe(400);
      expect(body).toEqual({ msg: "Invalid user ID" });
    });
  });
  describe("/api/reviews/:id", () => {
    describe("DELETE", () => {
      test("204: deletes the review and responds with no content", async () => {
        const { body: reviewBody } = await request(app).get(
          "/api/properties/2/reviews"
        );
        const reviewId = reviewBody.reviews[0].review_id;

        const { status } = await request(app).delete(
          `/api/reviews/${reviewId}`
        );
        expect(status).toBe(204);
      });

      test("404: responds with 'Review not found' when id does not exist", async () => {
        const { body, status } = await request(app).delete("/api/reviews/9999");
        expect(status).toBe(404);
        expect(body).toEqual({ msg: "Review not found" });
      });

      test("400: responds with 'Invalid review ID' when id is not a number", async () => {
        const { body, status } = await request(app).delete("/api/reviews/abc");
        expect(status).toBe(400);
        expect(body).toEqual({ msg: "Invalid review ID" });
      });
    });
  });
});

afterAll(() => db.end());
