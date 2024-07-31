const { checkSchema } = require("express-validator")
const { BIDS_MESSAGES } = require("../../controller-messages/bids-messages/bids.messages")

const addBidsValidation = () => {
    return checkSchema({

        job_title: {
            notEmpty: {
                errorMessage: BIDS_MESSAGES.JOB_TITLE_EMPTY,
            }
        },
        job_url: {
            notEmpty: {
                errorMessage: BIDS_MESSAGES.JOB_URL_EMPTY
            }
        },
        technology: {
            notEmpty: {
                errorMessage: BIDS_MESSAGES.TECHNOLOGY_EMPTY
            }
        },
        rate: {
            notEmpty: {
                errorMessage: BIDS_MESSAGES.RATE_EMPTY
            }
        },
        country: {
            notEmpty: {
                errorMessage: BIDS_MESSAGES.COUNTRY_EMPTY
            }
        },
        job_type: {
            notEmpty: {
                errorMessage: BIDS_MESSAGES.JOB_TYPE_EMPTY
            }
        },
    })
}

module.exports = { addBidsValidation }