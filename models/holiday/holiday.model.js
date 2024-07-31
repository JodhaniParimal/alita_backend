const mongoose = require("mongoose");
const {
    HOLIDAY,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
    title: { type: String, required: true },
    holiday_date: {
        type: String,
        required: true
    },
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
        required: false,
    },
    deleted_by: {
        type: String,
        default: null,
    },
},
    {
        timestamps: true,
    });

const Holiday = mongoose.model(HOLIDAY, schema);
module.exports = Holiday;
