const mongoose = require("mongoose");
const { ROLE } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  role: { type: String, required: true, unique: true },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  created_by: {
    type: String,
    default: null,
  },
  updated_by: {
    type: String,
    default: null,
  },
  deleted_by: {
    type: String,
    default: null,
  },
  created_date: {
    type: Date,
    default: new Date(),
  },
});

const Roles = mongoose.model(ROLE, schema);
module.exports = Roles;
