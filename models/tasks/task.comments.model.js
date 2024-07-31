const mongoose = require("mongoose");
const {
  TASKS,
  TASK_COMMENTS,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  comment: { type: String, required: true },
  commented_by: { type: String, required: true },
  name: { type: String, required: true },

  task_id: { type: mongoose.Types.ObjectId, ref: TASKS, required: true },

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
  updated_date: {
    type: Date,
    default: new Date(),
  },
});

const Task_Comments = mongoose.model(TASK_COMMENTS, schema);
module.exports = { Task_Comments };
