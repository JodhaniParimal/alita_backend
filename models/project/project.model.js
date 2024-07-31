const { default: mongoose } = require("mongoose");
const { ENUMS } = require("../../constants/enum.constants");
const {
  PROJECT,
  LEAD,
  CLIENT,
} = require("../../constants/models.enum.constants");

const projectSchema = mongoose.Schema(
  {
    project_start_date: {
      type: String,
      required: true,
    },
    project_code: {
      type: String,
      required: true,
    },
    profile:{
      type: String,
      required: false,
    },
    lead_code: {
      type: mongoose.Schema.Types.Number,
      ref: LEAD,
      required: false,
    },
    technology: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    estimated_hours: {
      type: Number,
      required: true,
    },
    remaining_hours: {
      type: Number,
      required: false,
    },
    weekly_limit_summary: {
      type: Number,
      required: true,
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CLIENT,
      default: null,
    },
    project_title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        ENUMS.PROJECT_STATUS.PROJECT_STATUS_WORKING,
        ENUMS.PROJECT_STATUS.PROJECT_STATUS_HOLD,
        ENUMS.PROJECT_STATUS.PROJECT_STATUS_COMPLETED,
      ],
      default: ENUMS.PROJECT_STATUS.PROJECT_STATUS_WORKING,
    },
    nda: {
      type: Boolean,
      default: false,
    },
    nda_status: {
      type: String,
      enum: [
        ENUMS.NDA_STATUS.NDA_STATUS_HOURLY,
        ENUMS.NDA_STATUS.NDA_STATUS_FIXED,
      ],
      default: ENUMS.NDA_STATUS.NDA_STATUS_HOURLY,
    },
    project_rate: {
      type: Number,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    updated_by: {
      type: String,
      required: false,
      default: null,
    },
    created_by: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model(PROJECT, projectSchema);

module.exports = { Project };
