const mongoose = require("mongoose");
const {
    LEAVE,
} = require("../../constants/models.enum.constants");
const { ENUMS } = require("../../constants/enum.constants");

const { Schema } = mongoose;

var schema = Schema({
    employee_code: { type: String, required: true },
    leave_date: {
        type: String,
        required: true,
    },
    leave_type: {
        type: String,
        required: true
    },
    leave_category: {
        type: String,
        enum: [
            ENUMS.LEAVE_CATEGORY.FULL,
            ENUMS.LEAVE_CATEGORY.POSTLUNCH,
            ENUMS.LEAVE_CATEGORY.PRELUNCH,
            ENUMS.LEAVE_CATEGORY.SHORT,
        ],
        required: true
    },
    from:{
        type: String,
        required: false,
        default: null,
    },
    to:{
        type: String,
        required: false, 
        default: null,
    },
    leave_reason: {
        type: String,
        required: true
    },
    reject_reason: {
        type: String,
        default: null,
    },
    leave_status: {
        type: String,
        enum: [
            ENUMS.LEAVE_STATUS.APPROVE,
            ENUMS.LEAVE_STATUS.PENDING,
            ENUMS.LEAVE_STATUS.REJECTED,
            ENUMS.LEAVE_STATUS.UNAPPROVE,

        ],
        default: ENUMS.LEAVE_STATUS.PENDING,
    },
    covering_hours: {
        type: Boolean,
        default: false,
        required: false,
    },
    approve_rejected_by: {
        type: String,
        default: null,
    },
    approve_rejected_on: {
        type: Date,
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

const Leave = mongoose.model(LEAVE, schema);
module.exports = Leave;
