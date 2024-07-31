const express = require("express")
const { addSummaries } = require("../../controllers/lead/summaries.controller")
const summariesRouter = express.Router()

summariesRouter.post('/add-summaries', addSummaries)

module.exports = { summariesRouter }