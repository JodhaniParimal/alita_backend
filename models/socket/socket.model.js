const mongoose = require("mongoose");
const { SOCKET } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
  {
    socket_id: { type: String, required: true },
    employee_code: { type: String, required: true },
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

const Sockets = mongoose.model(SOCKET, schema);
module.exports = { Sockets };
