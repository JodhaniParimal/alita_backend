const mongoose = require("mongoose");
const {
  EMPLOYEE_ACTIVITY_EVENT_LOG,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    employee_code: { type: String, required: true },
    events: [
      {
        mouse: { type: String, default: null },
        keyboard: { type: String, default: null },
        start_time: { type: Date, default: null },
        end_time: { type: Date, default: null },
      },
    ],
    screenshot: { type: String, default: null },
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

const employee_activity_event_log = mongoose.model(
  EMPLOYEE_ACTIVITY_EVENT_LOG,
  schema
);
module.exports = { employee_activity_event_log };
