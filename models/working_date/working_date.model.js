const mongoose = require("mongoose");
const { WORKING_DATE } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    working_date: {
      type: Date,
      required: true,
    },
    daily_time: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const Working_date = mongoose.model(WORKING_DATE, schema);
module.exports = Working_date;
