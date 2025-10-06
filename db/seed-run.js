const seed = require("./seed");
const {
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
} = require("./data/test");

seed(propertyTypesData, usersData, reviewsData, propertiesData);
