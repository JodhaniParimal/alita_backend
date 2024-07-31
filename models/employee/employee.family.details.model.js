const mongoose = require("mongoose");
const {
  EMPLOYEE_FAMILY_DETAILS,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, required: true, unique: true },

  details: [
    {
      name: { type: String, default: null},
      relation: { type: String, default: null},
      occupation: { type: String, default: null},
      occupation_address: { type: String, default: null },
      occupation_phone_number: { type: String, default: null },
      personal_phone_number: { type: String, default: null},
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

const Employee_Family_Details = mongoose.model(EMPLOYEE_FAMILY_DETAILS, schema);
module.exports = Employee_Family_Details;
