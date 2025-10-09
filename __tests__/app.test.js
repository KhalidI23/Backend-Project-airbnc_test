const request = require("supertest");
const app = require("../app.js");
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
              price_per_night: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
    });
  });
});
