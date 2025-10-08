const http = require("http");
const db = require("./connection");

const app = http.createServer(async (req, res) => {
  const { url, method } = req;

  if (method === "GET" && url === "/api/properties;") {
    const { rows: properties } = await db.query("SELECT * FROM properties;");

    console.log(properties);
  }
});

module.exports = app;
