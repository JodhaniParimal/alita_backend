const mongoose = require("mongoose");
const {
  EMPLOYEE,
  EMPLOYEE_OFFICE_DETAILS,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, required: true },

  shift_time: [
    {
      start_time: { type: String, default: null },
      end_time: { type: String, default: null },
    },
  ],

  position: { type: String, default: null },

  department: { type: String, default: null },

  year_of_experience: { type: String, default: null },

  past_company_details: [
    {
      company_name: { type: String, default: null },
      position: { type: String, default: null },
      start_date: { type: Date, default: null },
      end_date: { type: Date, default: null },
      starting_salary: { type: String, default: null },
      ending_salary: { type: String, default: null },
    },
  ],

  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_disable: {
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

const Employee_Office_Details = mongoose.model(EMPLOYEE_OFFICE_DETAILS, schema);
module.exports = Employee_Office_Details;
