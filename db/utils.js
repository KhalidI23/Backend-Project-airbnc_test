function createUserRef(users = []) {
  const ref = {};
  users.forEach((user) => {
    const fullName = `${user.first_name} ${user.surname}`;
    ref[fullName] = user.user_id;
  });
  return ref;
}

function createPropertyRef(properties = []) {
  const ref = {};
  properties.forEach((p) => {
    ref[p.name] = p.property_id;
  });
  return ref;
}

function formatProperties(properties = [], userRef = {}) {
  const rows = [];

  properties.forEach((prop) => {
    if (!prop.host_name) return;

    const hostId = userRef[prop.host_name];
    if (!hostId) return;

    rows.push([
      hostId,
      prop.name,
      prop.location,
      prop.property_type,
      prop.price_per_night,
      prop.description,
    ]);
  });

  return rows;
}

function formatReviews(reviews = [], userRef = {}, propertyRef = {}) {
  const rows = [];
  const seen = new Set();

  reviews.forEach((r) => {
    const guestId = userRef[r.guest_name];
    const propertyId = propertyRef[r.property_name];
    if (!guestId || !propertyId) return;

    const key = `${propertyId}-${guestId}`;
    if (seen.has(key)) return;
    seen.add(key);

    rows.push([
      propertyId,
      guestId,
      r.rating,
      r.comment,
      r.created_at || new Date().toISOString(),
    ]);
  });

  return rows;
}

module.exports = {
  createUserRef,
  createPropertyRef,
  formatProperties,
  formatReviews,
};
