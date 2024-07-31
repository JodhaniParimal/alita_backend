const { default: mongoose } = require("mongoose");
const { PROJECT, ADD_HOURS } = require("../../constants/models.enum.constants");

const addHoursSchema = mongoose.Schema({

    date: {
        type: String,
        required: true
    },
    project_code: {
        type: String,
        ref: PROJECT,
        required: true,
    },
    project_title: {
        type: String,
        required: true,
    },
    client_name: {
        type: String,
        required: true,
    },
    hours: {
        type: Number,
        required: true,
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
    deleted_by: {
        type: String,
        required: false,
        default: null
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
        timestamps: true,
    }
)

const Add_Hours = mongoose.model(ADD_HOURS, addHoursSchema)

module.exports = { Add_Hours }