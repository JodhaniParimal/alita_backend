const { checkSchema } = require("express-validator")
const { PROJECT_MESSAGES } = require("../../controller-messages/project-messages/project.messages")
const { checkColumn } = require("../../helpers/fn")
const { Project } = require("../../models/project/project.model")

const addProjectValidation = () => {
    return checkSchema({
        project_code: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.PROJECT_CODE_REQUIRED,
            },
            custom: {
                options: (value) => {
                    return checkColumn(
                        Project,
                        "project_code",
                        value,
                        "",
                        PROJECT_MESSAGES.PROJECT_CODE_EXISTS,
                        "unique",
                        false
                    )
                }
            },
        },
        lead_code: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.LEAD_CODE_REQUIRED,
            }
        },
        technology: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.TECHNOLOGY_REQUIRED,
            }
        },
        estimated_hours: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.ESTIMATED_HOURS_REQUIRED,
            }
        },
        weekly_limit_summary: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.WEEKLY_LIMIT_SUMMARY_REQUIRED,

            }
        },
        project_title: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.PROJECT_TITLE_REQUIRED,
            }
        },
        status: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.STATUS_REQUIRED,
            }
        },
        nda: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.NDA_REQUIRED,
            }
        },
        nda_status: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.NDA_STATUS_REQUIRED,
            }
        },
        project_rate: {
            notEmpty: {
                errorMessage: PROJECT_MESSAGES.PROJECT_RATE_REQUIRED,
            }
        }
    })
}

module.exports = { addProjectValidation }