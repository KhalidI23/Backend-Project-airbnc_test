function createUserRef(users = []) {
  const ref = {};
  users.forEach((user) => {
    const fullName = `${user.first_name} ${user.surname}`;
    ref[fullName] = user.user_id;
  });
  return ref;
}

function formatProperties(properties = [], userRef = {}) {
  const rows = [];

  properties.forEach((prop, i) => {
    // Check that host_name exists
    if (!prop.host_name) {
      console.warn(`⚠️ property[${i}] is missing host_name:`, prop);
      return; // skip this property
    }

    const hostId = userRef[prop.host_name];

    // Check that host_name matches an existing user
    if (!hostId) {
      console.warn(
        `⚠️ property[${i}] host "${prop.host_name}" not found in userRef`
      );
      return; // skip this property instead of throwing
    }

    // Push formatted row
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

module.exports = { createUserRef, formatProperties };
