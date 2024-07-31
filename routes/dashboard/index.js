const express = require("express")
const { dashboardRouter } = require("./dashboard.routes")
const { mainDashboardRoute } = require("./main.dashbord.routes")

const dashboardIndex = new express.Router()

dashboardIndex.use("/", dashboardRouter)
dashboardIndex.use("/main", mainDashboardRoute)

module.exports = { dashboardIndex }
