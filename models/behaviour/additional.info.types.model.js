const mongoose = require("mongoose");
const {
  ADDITIONAL_INFO_TYPES,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  title: { type: String, required: true },
  created_date: {
    type: Date,
    default: new Date(),
  },
  deleted_by: {
    type: String,
    default: null,
  },
  updated_date: {
    type: Date,
    default: new Date(),
  },
  is_deleted: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const Additional_Info_Types = mongoose.model(ADDITIONAL_INFO_TYPES, schema);
module.exports = Additional_Info_Types;
