const { default: mongoose } = require("mongoose");
const { LEAD, ATTACHMENTS } = require("../../constants/models.enum.constants");

const attachmentsSchema = mongoose.Schema({

    lead_code: {
        type: mongoose.Schema.Types.Number,
        ref: LEAD,
        required: true
    },
    path: {
        type: String,
        required: false
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

const Attachment = mongoose.model(ATTACHMENTS, attachmentsSchema)

module.exports = { Attachment }