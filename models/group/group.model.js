const mongoose = require("mongoose");
const { GROUP } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  title: { type: String, unique: true, required: true },
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

const Group = mongoose.model(GROUP, schema);
module.exports = Group;
