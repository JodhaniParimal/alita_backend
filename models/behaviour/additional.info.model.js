const mongoose = require("mongoose");
const {
  ADDITIONAL_INFO,
  ADDITIONAL_INFO_TYPES,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: {
    type: String,
    required: true,
  },
  additional_info_type_id: {
    type: mongoose.Types.ObjectId,
    ref: ADDITIONAL_INFO_TYPES,
    required: true,
  },
  answer:{
    type: String,
    required: true,
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

const Additional_Info = mongoose.model(ADDITIONAL_INFO, schema);
module.exports = Additional_Info;
