const mongoose = require("mongoose");
const { EMPLOYEE_TRACKER, TRACKER_INFO } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
    {
        employee_code: { type: String },
        tracker_info: [
            {
                start_time: { type: Date },
                end_time: { type: Date },
                is_idle: { type: Boolean, default: false },
                is_break: { type: Boolean, default: false },
                clock_out: { type: Boolean, default: false },
                difference: { type: String, default: "00:00:00" },
                tracker_id: { type: mongoose.Types.ObjectId, ref: EMPLOYEE_TRACKER, required: true },
            },
        ],
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

const Tracker_info = mongoose.model(TRACKER_INFO, schema);
module.exports = { Tracker_info };
