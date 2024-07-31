const mongoose = require("mongoose");
const { PLATFORM } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
  created_date: {
    type: Date,
    default: new Date(),
  },
  updated_date: {
    type: Date,
    default: new Date(),
  },
  updated_by: {
    type: String,
    default: null,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    required: false,
  },
  deleted_by: {
    type: String,
    default: null,
  },
});

const Platform = mongoose.model(PLATFORM, schema);
module.exports = Platform;
