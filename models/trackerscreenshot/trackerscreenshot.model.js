const { default: mongoose } = require("mongoose");
const { TRACKER_SCREENSHOTS } = require("../../constants/models.enum.constants");

const screenshotSchema = mongoose.Schema({

    employee_code: {
        type: String,
        required: false
    },
    images: {
        type: String,
        required: false
    },
    full_name: {
        type: String,
        required: false
    },
    department: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    screenshot_name: {
        type: String,
        required: false
    },
    image_uploaded: {
        type: Boolean,
        required: false,
        default: false
    },
    is_disable: {
        type: Boolean,
        required: false,
        default: false
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
    deleted_by: {
        type: String,
        required: false,
        default: null
    }

},
    {
        timestamps: true,
    }
)

const Screenshot = mongoose.model(TRACKER_SCREENSHOTS, screenshotSchema)

module.exports = { Screenshot }




