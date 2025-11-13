const testData = require("./test");
const devData = require("./dev");
const data = { development: devData, test: testData, production: devData };

const ENV = process.env.NODE_ENV || "development";

module.exports = data[ENV];
