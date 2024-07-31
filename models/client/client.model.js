const mongoose = require("mongoose");
const {
    CLIENT,
} = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
    client_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
        default: null
    },
    skype_id: {
        type: String,
        required: false,
        default: null
    },
    phone_number: {
        type: String,
        required: false,
        default: null
    },
    linkedin_url: {
        type: String,
        required: false,
        default: null
    },
    company_name: {
        type: String,
        required: false,
        default: null
    },
    company_url: {
        type: String,
        required: false,
        default: null
    },
    country: {
        type: String,
        required: false,
        default: null
    },
    city: {
        type: String,
        required: false,
        default: null
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
        timestamps: true
    }
);

const Client = mongoose.model(CLIENT, schema);
module.exports = Client;
