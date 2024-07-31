const { default: mongoose } = require("mongoose");
const {
  EMP_HOURS,
  ADD_HOURS,
} = require("../../constants/models.enum.constants");

const empHoursSchema = mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    hour_id: {
      type: mongoose.Types.ObjectId,
      ref: ADD_HOURS,
      required: true,
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
    deleted_by: {
      type: String,
      required: false,
      default: null,
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

const Employee_Hours = mongoose.model(EMP_HOURS, empHoursSchema);

module.exports = { Employee_Hours };
