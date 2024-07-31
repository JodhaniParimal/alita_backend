const mongoose = require("mongoose");
const {
  EMPLOYEE_SKILL_RATING,
  EMPLOYEE_SKILL,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  rating: { type: String},
  employee_code: {
    type: String,
    required: true,
  },
  employee_skill_id: {
    type: mongoose.Types.ObjectId,
    ref: EMPLOYEE_SKILL,    
  },
  skill_type:{
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
  is_disable: {
    type: Boolean,
    default: false,
    required: false,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const Employee_Skill_Rating = mongoose.model(
  EMPLOYEE_SKILL_RATING,
  schema
);
module.exports = { Employee_Skill_Rating };
