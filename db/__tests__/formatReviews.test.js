const { formatReviews } = require("../utils");

describe("formatReviews", () => {
  test("returns empty array when given no reviews", () => {
    expect(formatReviews([], {}, {})).toEqual([]);
  });

  test("formats valid reviews with guest and property IDs", () => {
    const reviews = [
      {
        guest_name: "Bob Smith",
        property_name: "Modern Apartment",
        rating: 4,
        comment: "Nice place",
      },
    ];
    const userRef = { "Bob Smith": 2 };
    const propertyRef = { "Modern Apartment": 10 };
    const rows = formatReviews(reviews, userRef, propertyRef);

    expect(rows[0][0]).toBe(10);
    expect(rows[0][1]).toBe(2);
    expect(rows[0][2]).toBe(4);
    expect(rows[0][3]).toBe("Nice place");
  });

  test("skips reviews with missing guest or property reference", () => {
    const reviews = [
      { guest_name: "Missing Host", property_name: "Unknown", rating: 5 },
    ];
    const rows = formatReviews(reviews, {}, {});
    expect(rows).toEqual([]);
  });

  test("skips duplicate (property_id, guest_id) pairs", () => {
    const reviews = [
      {
        guest_name: "Bob Smith",
        property_name: "Modern Apartment",
        rating: 4,
      },
      {
        guest_name: "Bob Smith",
        property_name: "Modern Apartment",
        rating: 5,
      },
    ];
    const userRef = { "Bob Smith": 2 };
    const propertyRef = { "Modern Apartment": 10 };
    const rows = formatReviews(reviews, userRef, propertyRef);

    expect(rows.length).toBe(1);
  });
});
