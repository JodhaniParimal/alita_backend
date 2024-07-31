const express = require("express")
const {
    workReport,
    employeeWorkReport,
    technologyWorkReport,
    workReportdwm
} = require("../../controllers/dashboard/dashboard.controller")

const dashboardRouter = new express.Router()

/* LIST WORKREPORT*/
dashboardRouter.post('/work-report', workReport)

/* LIST EMPLOYEE WORK REPORT*/
dashboardRouter.post('/employee-work-report', employeeWorkReport)

/* LIST TECHNOLOGY WORK REPORT*/
dashboardRouter.post('/technology-work-report', technologyWorkReport)

/* LIST WORKREPORT DAILY WEEKLY AND MONTHLY */
dashboardRouter.get('/workreport-dwm', workReportdwm)


module.exports = { dashboardRouter }