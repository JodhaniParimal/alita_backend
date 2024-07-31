const mongoose = require("mongoose");
const {
  SNACKS_ITEMS,
  SNACKS_CATEGORY,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    name: { type: String, required: true },
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: SNACKS_CATEGORY,
      required: true,
    },
    is_available: { type: Boolean, default: true },
    price: { type: Number, required: true },
    image: { type: String, default: null },
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

const Snacks_Items = mongoose.model(SNACKS_ITEMS, schema);
module.exports = { Snacks_Items };
