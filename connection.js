const db = require("./config/database");

try {
  db()
    .then(() => console.log("Database connected."))
    .catch((err) => console.log("ERROR", err));
} catch (err) {
  console.error("Error in connection", err);
}
