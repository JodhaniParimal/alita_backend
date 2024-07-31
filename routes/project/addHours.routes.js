const express = require("express")
const {
    addHours,
    updateHours,
    deleteHours,
    listHoursByCode,
    listHoursById,
    Hour,
    generateAddHourPDF,
    listProjectHours,
    hourListForProject,
} = require("../../controllers/project/addHours.controller")
const { addHoursValidation } = require("../../validation_rules/project/addHours.validation")
const { validateApi } = require("../../middlewares/validator")

const addHoursRouter = new express.Router()


addHoursRouter.post("/add-hours", addHoursValidation(), validateApi, addHours)

addHoursRouter.post('/list-hours', Hour)

addHoursRouter.post(
    "/generate-pdf-addhours",
    // authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_DOWNLOAD]),
    generateAddHourPDF
);

addHoursRouter.get('/list-hours-id/:id', listHoursById)

addHoursRouter.post('/hours-list-project-code', listProjectHours)

addHoursRouter.get('/all-hours-list-project/:project_code', hourListForProject)

addHoursRouter.put('/update-hours/:id', updateHours)

addHoursRouter.delete('/delete-hours/:id', deleteHours)

module.exports = { addHoursRouter }