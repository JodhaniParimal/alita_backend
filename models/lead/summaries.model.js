const { default: mongoose } = require("mongoose");
const { LEAD_COMMENTS, SUMMARIES } = require("../../constants/models.enum.constants");

const summariesSchema = mongoose.Schema({
    lead_comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: LEAD_COMMENTS,
        required: true
    },
    follow_up: {
        type: Number,
        default: 0
    },
    follow_up_comment: {
        type: String,
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

},
    {
        timestamps: true
    }
)

const Summaries = mongoose.model(SUMMARIES, summariesSchema)

module.exports = { Summaries }