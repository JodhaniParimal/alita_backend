const mongoose = require("mongoose");
const { EMPLOYEE_DOCUMENTS } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, required: false, unique: true },
  certificates: [
    {
      name: { type: String, default: null },
      number: { type: String, default: null },
      image: { type: String, default: null },
    },
  ],
  documents: [
    {
      name: { type: String, default: null },
      number: { type: String, default: null },
      image: { type: String, default: null },
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

const Employee_Documents = mongoose.model(EMPLOYEE_DOCUMENTS, schema);
module.exports = Employee_Documents;
