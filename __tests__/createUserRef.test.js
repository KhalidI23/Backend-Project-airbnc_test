const { createUserRef } = require("../db/utils");

describe("createUserRef", () => {
  test("returns empty object when passed empty array", () => {
    expect(createUserRef([])).toEqual({});
  });

  test("assigns 'First Last' as key on ref object", () => {
    const users = [{ user_id: 1, first_name: "Alice", surname: "Johnson" }];
    const ref = createUserRef(users);
    expect(ref).toHaveProperty("Alice Johnson");
  });

  test("assigns user_id as value for full name key", () => {
    const users = [{ user_id: 1, first_name: "Alice", surname: "Johnson" }];
    const ref = createUserRef(users);
    expect(ref["Alice Johnson"]).toBe(1);
  });

  test("assigns multiple key/value pairs", () => {
    const users = [
      { user_id: 1, first_name: "Alice", surname: "Johnson" },
      { user_id: 2, first_name: "Bob", surname: "Smith" },
    ];
    const ref = createUserRef(users);
    expect(ref).toEqual({
      "Alice Johnson": 1,
      "Bob Smith": 2,
    });
  });
});
