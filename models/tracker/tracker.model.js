const mongoose = require("mongoose");
const { EMPLOYEE_TRACKER } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    start_time: { type: Date },
    end_time: { type: Date },
    is_idle: { type: Boolean, default: false },
    is_break: { type: Boolean, default: false },
    clock_out: { type: Boolean, default: false },
    employee_code: { type: String, required: true },
    difference: { type: String, default: "00:00:00" },
    created_by: {
      type: String,
      default: null,
    },
    updated_by: {
      type: String,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
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

const tracker = mongoose.model(EMPLOYEE_TRACKER, schema);
module.exports = { tracker };
