const { checkSchema } = require("express-validator")
const { ADD_HOURS_MESSAGES } = require("../../controller-messages/project-messages/addHours.messages")

const addHoursValidation = () => {
    return checkSchema({
        // project_code: {
        //     notEmpty: {
        //         errorMessage: ADD_HOURS_MESSAGES.PROJECT_CODE_REQUIRED
        //     }
        // },
        // project_title: {
        //     notEmpty: {
        //         errorMessage: ADD_HOURS_MESSAGES.PROJECT_TITLE_REQUIRED
        //     }
        // },
        // client_name: {
        //     notEmpty: {
        //         errorMessage: ADD_HOURS_MESSAGES.CLIENT_NAME_REQUIRED
        //     }
        // },
        // hours: {
        //     notEmpty: {
        //         errorMessage: ADD_HOURS_MESSAGES.HOURS_REQUIRED
        //     },
        // }
    })
}

module.exports = { addHoursValidation }