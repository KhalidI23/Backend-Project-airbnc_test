const { createPropertyRef } = require("../db/utils");

describe("createPropertyRef", () => {
  test("returns empty object when passed empty array", () => {
    expect(createPropertyRef([])).toEqual({});
  });

  test("assigns property name as key", () => {
    const properties = [{ property_id: 1, name: "Modern Apartment" }];
    const ref = createPropertyRef(properties);
    expect(ref).toHaveProperty("Modern Apartment");
  });

  test("assigns property_id as value", () => {
    const properties = [{ property_id: 1, name: "Modern Apartment" }];
    const ref = createPropertyRef(properties);
    expect(ref["Modern Apartment"]).toBe(1);
  });

  test("handles multiple key/value pairs", () => {
    const properties = [
      { property_id: 1, name: "Modern Apartment" },
      { property_id: 2, name: "Cosy Loft" },
    ];
    const ref = createPropertyRef(properties);
    expect(ref).toEqual({
      "Modern Apartment": 1,
      "Cosy Loft": 2,
    });
  });
});
