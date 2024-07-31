const mongoose = require("mongoose");
const { TECH_SUPPORT } = require("../../constants/models.enum.constants");
const { ENUMS } = require("../../constants/enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    employee_code: {
      type: String,
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    ticket_code: {
      type: String,
      required: true,
    },
    ticket_status: {
      type: String,
      enum: [
        ENUMS.TICKET_STATUS.TICKET_STATUS_OPEN,
        ENUMS.TICKET_STATUS.TICKET_STATUS_COLSE,
      ],
      default: ENUMS.TICKET_STATUS.TICKET_STATUS_OPEN,
    },
    urgent: {
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
    is_deleted: {
      type: Boolean,
      default: false,
      required: false,
    },
    deleted_by: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Tech_support = mongoose.model(TECH_SUPPORT, schema);
module.exports = Tech_support;
