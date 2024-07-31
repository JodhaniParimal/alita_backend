const mongoose = require("mongoose");
const { TEAM_MANAGMENT } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema(
    {
        team_leader: {
            type: String,
            required: true,
        },
        team_member: [
            {
                type: String,
                required: true,
            }
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
            required: false,
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

const Team_managment = mongoose.model(TEAM_MANAGMENT, schema);
module.exports = Team_managment;
