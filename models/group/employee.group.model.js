const mongoose = require("mongoose");
const {
  EMPLOYEE_GROUP,
  GROUP,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, unique: true, required: true },
  group_id: {
    type: mongoose.Types.ObjectId,
    ref: GROUP,
    required: true,
  },
  created_by: {
    type: String,
    default: null,
  },
  updated_by: {
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

const Employee_Group = mongoose.model(EMPLOYEE_GROUP, schema);
module.exports = Employee_Group;
