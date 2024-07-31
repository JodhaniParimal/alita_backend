const { default: mongoose } = require("mongoose");
const Employee = require("../models/employee/employee.model");
const Roles = require("../models/role/role.model");

const bcrypt = require("bcryptjs");
const { dataEntry } = require("../helpers/databaseEntries.script");
require("dotenv").config();

const database = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const mongo = process.env.DB_TYPE;
const user = process.env.DB_USERNAME;
const pwd = process.env.DB_PASSWORD;
let uri;
if (process.env.PROJECT_ENV === "production") {
  uri = `${mongo}://${user}:${pwd}@${host}:${port}/${database}?authSource=admin`;
} else {
  uri = `${mongo}://${host}:${port}/${database}`;
}

const db = async () => {
  try {
    await mongoose.connect(uri);
    dataEntry();
  } catch (err) {
    console.error("errrr", err);
  }
};

module.exports = db;
