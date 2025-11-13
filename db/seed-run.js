const seed = require("./seed");
const {
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
} = require("./data");

seed(propertyTypesData, usersData, propertiesData, reviewsData);
