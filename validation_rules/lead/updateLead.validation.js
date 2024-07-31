const { checkSchema } = require("express-validator")
const { LEAD_MESSAGES } = require("../../controller-messages/lead-messages/lead.messages")

const updateLeadValidation = () => {
    return checkSchema({
        project_name: {
            notEmpty: {
                errorMessage: LEAD_MESSAGES.PROJECT_NAME_EMPTY,
            },
        },
        // client_name: {
        //     notEmpty: {
        //         errorMessage: LEAD_MESSAGES.CLIENT_NAME_EMPTY,
        //     },
        //     isString: {
        //         errorMessage: LEAD_MESSAGES.CLIENT_NAME_INVALID,
        //     }
        // },
        technology: {
            notEmpty: {
                errorMessage: LEAD_MESSAGES.TECHNOLOGY_EMPTY,
            },
        },
        status: {
            notEmpty: {
                errorMessage: LEAD_MESSAGES.STATUS_EMPTY,
            },
            isString: {
                errorMessage: LEAD_MESSAGES.STATUS_INVALID,
            }
        },
        discription: {
            notEmpty: {
                errorMessage: LEAD_MESSAGES.DESCRIPTION_EMPTY,
            },
            isString: {
                errorMessage: LEAD_MESSAGES.DESCRIPTION_INVALID,
            }
        }

    })
}

module.exports = { updateLeadValidation }  