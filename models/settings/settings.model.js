const mongoose = require("mongoose");
const { SETTINGS } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    master_password: { type: String, default: null },
    created_by: {
      type: String,
      default: null,
    },
    updated_by: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model(SETTINGS, schema);
module.exports = { Settings };
