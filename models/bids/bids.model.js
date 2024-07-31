const { default: mongoose } = require("mongoose");
const { BIDS, PLATFORM, CLIENT } = require("../../constants/models.enum.constants");
const { ENUMS } = require("../../constants/enum.constants");

const bidSchema = mongoose.Schema({

    job_title: {
        type: String,
        required: true
    },
    bids_code: {
        type: String,
        required: true,
        unique: true
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CLIENT,
        default: null,
    },
    job_url: {
        type: String,
        required: true
    },
    technology: [
        {
            type: mongoose.Types.ObjectId,
            required: true,
        }
    ],
    rate: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    platform_id: {
        type: mongoose.Types.ObjectId,
        ref: PLATFORM,
        required: true,
    },
    job_type: {
        type: String,
        enum: [
            ENUMS.JOB_TYPE.JOB_TYPE_HOURLY,
            ENUMS.JOB_TYPE.JOB_TYPE_WEEKLY,
            ENUMS.JOB_TYPE.JOB_TYPE_MONTHLY,
            ENUMS.JOB_TYPE.JOB_TYPE_FIXED
        ],
        default: ENUMS.JOB_TYPE.JOB_TYPE_HOURLY
    },
    status: {
        type: String,
    },
    bid_date: {
        type: String,
        required: true
    },
    bidder_name: {
        type: String,
        required: true
    },
    is_deleted: {
        type: Boolean,
        required: false,
        default: false
    },
    updated_by: {
        type: String,
        required: false,
        default: null
    },
    created_by: {
        type: String,
        required: false,
        default: null
    },
},
    {
        timestamps: true
    }
);

const Bids = mongoose.model(BIDS, bidSchema)

module.exports = { Bids }