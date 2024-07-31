const mongoose = require("mongoose");
const {
  EMPLOYEE_CONTACT_DETAILS,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, required: true, unique: true },

  emergency_numbers: [
    {
      name: { type: String, default: null},
      relation: { type: String, default: null},
      location: { type: String, default: null},
      phone_number: { type: String, default: null},
    },
  ],

  address: {
    current_address: { type: String, default: null },
    permanent_address: { type: String, default: null },
    landmark: { type: String, default: null },
    street: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    pincode: { type: String, default: null },
  },

  phone_number: { type: String, default: null},
  alternative_phone_number: { type: String, default: null},

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

const Employee_Contact_Details = mongoose.model(
  EMPLOYEE_CONTACT_DETAILS,
  schema
);
module.exports = Employee_Contact_Details;
