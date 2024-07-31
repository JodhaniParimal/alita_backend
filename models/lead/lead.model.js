const { default: mongoose } = require("mongoose");
const { ENUMS } = require("../../constants/enum.constants");
const { LEAD, BIDS, CLIENT } = require("../../constants/models.enum.constants");

const leadSchema = mongoose.Schema(
  {
    bid_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: BIDS,
      required: true,
    },
    lead_date: {
      type: String,
      required: true,
    },
    lead_code: {
      type: Number,
      required: true,
      unique: true,
    },
    lead_assign: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    employee_code: {
      type: String,
      required: true,
    },
    project_name: {
      type: String,
      required: true,
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CLIENT,
      default: null,
    },
    technology: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: [
        ENUMS.LEAD_STATUS.LEAD_STATUS_OPEN,
        ENUMS.LEAD_STATUS.LEAD_STATUS_HIRED,
        ENUMS.LEAD_STATUS.LEAD_STATUS_FOLLOW_UP,
        ENUMS.LEAD_STATUS.LEAD_STATUS_REJECTED,
      ],
      default: ENUMS.LEAD_STATUS.LEAD_STATUS_OPEN,
    },
    discription: {
      type: String,
      required: false,
    },
    project_count: {
      type: Number,
      default: 0,
      required: false,
    },
    is_disable: {
      type: Boolean,
      required: false,
      default: false,
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

const Lead = mongoose.model(LEAD, leadSchema);

module.exports = { Lead };
