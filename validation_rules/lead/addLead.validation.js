
const { checkSchema } = require("express-validator")
const { checkColumn } = require("../../helpers/fn")
const { LEAD_MESSAGES } = require("../../controller-messages/lead-messages/lead.messages")
const { Lead } = require("../../models/lead/lead.model")

const addLeadValidation = () => {
    return checkSchema({
        bid_id: {
            notEmpty: {
                errorMessage: LEAD_MESSAGES.BID_ID_EMPTY
            }
        },
        lead_code: {
            notEmpty: {
                errorMessage: LEAD_MESSAGES.LEAD_CODE_EMPTY,
            },
            custom: {
                options: (value) => {
                    return checkColumn(
                        Lead,
                        "lead_code",
                        value,
                        "",
                        LEAD_MESSAGES.LEAD_CODE_EXISTS,
                        "unique",
                        false
                    )
                }
            },
            matches: {
                options: /^[0-9]{6}$/,
                errorMessage: LEAD_MESSAGES.LEAD_CODE_INVALID,
            }
        },
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

module.exports = { addLeadValidation }  