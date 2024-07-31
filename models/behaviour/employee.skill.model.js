const mongoose = require("mongoose");
const {
  EMPLOYEE_SKILL,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  title: { type: String, required: true },
  created_date: {
    type: Date,
    default: new Date(),
  },
  updated_date: {
    type: Date,
    default: new Date(),
  },
});

const Employee_Skills = mongoose.model(EMPLOYEE_SKILL, schema);
module.exports = { Employee_Skills };
