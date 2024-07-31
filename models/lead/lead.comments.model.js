const { default: mongoose } = require("mongoose");
const { LEAD, LEAD_COMMENTS } = require("../../constants/models.enum.constants");

const leadCommentsSchema = mongoose.Schema({

    employee_code: {
        type: String,
        required: true,
    },
    tech_comment: {
        type: String,
        required: true
    },
    lead_code: {
        type: mongoose.Schema.Types.Number,
        ref: LEAD,
        required: true
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

const Lead_Comments = mongoose.model(LEAD_COMMENTS, leadCommentsSchema)

module.exports = { Lead_Comments }