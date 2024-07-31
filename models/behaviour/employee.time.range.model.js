const mongoose = require("mongoose");
const {
  EMPLOYEE_TIME_RANGE,
  EMPLOYEE,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, required: true },
  from_time: { type: String, required: true },
  to_time: { type: String, required: true },
  created_date: {
    type: Date,
    default: new Date(),
  },
  updated_date: {
    type: Date,
    default: new Date(),
  },
  updated_by: {
    type: mongoose.Types.ObjectId,
    ref: EMPLOYEE,
    default: null,
  },
});

const Employee_Time_Range = mongoose.model(EMPLOYEE_TIME_RANGE, schema);
module.exports = { Employee_Time_Range };
