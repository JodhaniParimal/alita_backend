const mongoose = require("mongoose");
const { PERMISSION } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  name: { type: String, required: true, unique: true },
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

const Permission = mongoose.model(PERMISSION, schema);
module.exports = Permission;
