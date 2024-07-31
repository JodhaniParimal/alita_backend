const mongoose = require("mongoose");
const {
  SNACKS_ITEMS,
  SNACKS_ORDERS,
} = require("../../constants/models.enum.constants");
const { ENUMS } = require("../../constants/enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    employee_code: { type: String, required: true },
    order_items: [
      {
        item_id: {
          type: mongoose.Types.ObjectId,
          ref: SNACKS_ITEMS,
          required: true,
        },
        item_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, default: 0 },
    difference_amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        ENUMS.ORDER_STATUS.ORDER_SUCCESS,
        ENUMS.ORDER_STATUS.ORDER_PENDING,
        ENUMS.ORDER_STATUS.ORDER_REJECTED,
        ENUMS.ORDER_STATUS.ORDER_FAILED,
      ],
      default: ENUMS.ORDER_STATUS.ORDER_SUCCESS,
    },
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

const Snacks_Orders = mongoose.model(SNACKS_ORDERS, schema);
module.exports = { Snacks_Orders };
