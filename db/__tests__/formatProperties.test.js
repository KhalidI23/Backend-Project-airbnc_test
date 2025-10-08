const { formatProperties } = require("../utils");

describe("formatProperties", () => {
  test("returns empty array when passed no data", () => {
    expect(formatProperties([], {})).toEqual([]);
  });

  test("returns formatted rows using userRef", () => {
    const properties = [
      {
        name: "Modern Apartment",
        location: "London",
        property_type: "Apartment",
        price_per_night: 120,
        description: "Nice place",
        host_name: "Alice Johnson",
      },
    ];
    const userRef = { "Alice Johnson": 1 };
    const rows = formatProperties(properties, userRef);

    expect(rows).toEqual([
      [1, "Modern Apartment", "London", "Apartment", 120, "Nice place"],
    ]);
  });

  test("skips properties without valid host_name", () => {
    const properties = [{ name: "Nameless Flat" }];
    const rows = formatProperties(properties, { "Alice Johnson": 1 });
    expect(rows).toEqual([]);
  });
});
