const mongoose = require("mongoose");
const { TASKS } = require("../../constants/models.enum.constants");
const { ENUMS } = require("../../constants/enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  title: { type: String, required: true },
  project_code: { type: String, required: true },
  employee_code: { type: String, required: true },
  task_date: { type: Date, required: true },
  description: { type: String, default: null },
  client_time: { type: String, default: null },
  with_tracker: { type: Boolean, default: false },
  expected_tracker_time: { type: String, default: "0" },
  real_tracker_time: { type: String, default: "0" },
  due_date: { type: Date, default: new Date() },
  assigned_on: { type: Date, default: new Date() },
  status: {
    type: String,
    required: true,
    enum: [
      ENUMS.TASK_STATUS.TODO,
      ENUMS.TASK_STATUS.IN_PROGRESS,
      ENUMS.TASK_STATUS.READY_TO_QA,
      ENUMS.TASK_STATUS.DONE,
    ],
    default: ENUMS.TASK_STATUS.TODO,
  },
  status_history: [
    {
      status_from: { type: String, default: "" },
      status_to: { type: String, default: "" },
      updated_date: { type: Date, default: new Date() },
      updated_by: { type: String, default: "" },
    },
  ],
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_disabled: {
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

const Tasks = mongoose.model(TASKS, schema);
module.exports = { Tasks };
