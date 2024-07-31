const mongoose = require("mongoose");
const {
  EMPLOYEE,
  ROLE,
  DEPARTMENT,
} = require("../../constants/models.enum.constants");
const { ENUMS } = require("../../constants/enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  employee_code: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  firstname: { type: String, default: null },
  lastname: { type: String, default: null },
  middlename: { type: String, default: null },
  date_of_birth: { type: Date, default: null },
  blood_group: { type: String, default: null },
  date_of_joining: { type: Date, default: new Date() },
  gender: { type: String, default: null },
  profile_pic: { type: String, default: null },
  with_team: { type: Boolean, default: false },

  status: {
    type: String,
    enum: [
      ENUMS.EMPLOYEE_STATUS.STATUS_ACTIVE,
      ENUMS.EMPLOYEE_STATUS.STATUS_FIRED,
      ENUMS.EMPLOYEE_STATUS.STATUS_NOTICEPERIOD,
      ENUMS.EMPLOYEE_STATUS.STATUS_RESIGNED,
    ],
    default: ENUMS.EMPLOYEE_STATUS.STATUS_ACTIVE,
  },
  role_id: {
    type: mongoose.Types.ObjectId,
    ref: ROLE,
    required: true,
  },
  department_id: {
    type: mongoose.Types.ObjectId,
    ref: DEPARTMENT,
    required: true,
  },

  reset_token: { type: String },
  expire_token: { type: Date },
  token: { type: String, max: 500, default: null, required: false },
  last_login: { type: Date, default: null, required: false },
  tracker_token: { type: String, max: 500, default: null },
  last_tracker_login: { type: Date, default: null },

  is_deleted: {
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

const Employee = mongoose.model(EMPLOYEE, schema);
module.exports = Employee;
