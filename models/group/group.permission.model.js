const mongoose = require("mongoose");
const {
  GROUP_PERMISSION,
  GROUP,
  PERMISSION,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  group_id: { type: mongoose.Types.ObjectId, ref: GROUP, required: true },
  permission_id: {
    type: mongoose.Types.ObjectId,
    ref: PERMISSION,
    required: true,
  },
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
});

const Group_Permission = mongoose.model(GROUP_PERMISSION, schema);
module.exports = Group_Permission;
