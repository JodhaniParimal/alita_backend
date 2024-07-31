const mongoose = require("mongoose");
const { SNACKS_CATEGORY } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    name: { type: String, required: true },
    is_available: { type: Boolean, default: true },
    price_per_category: { type: Number, default: 10 },
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

const Snacks_Category = mongoose.model(SNACKS_CATEGORY, schema);
module.exports = { Snacks_Category };
