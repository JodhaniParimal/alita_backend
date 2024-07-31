const { default: mongoose } = require("mongoose");
const { PROJECT, EMPLOYEE_PROJECT } = require("../../constants/models.enum.constants");


const employeeProjectSchema = mongoose.Schema({

    employee_code: {
        type: String,
        required: true
    },
    project_code: {
        type: mongoose.Schema.Types.String,
        ref: PROJECT,
        required: true
    },
    assigned_type:{
        type: Number,
        default:0
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

const Employee_Project = mongoose.model(EMPLOYEE_PROJECT, employeeProjectSchema)

module.exports = { Employee_Project }