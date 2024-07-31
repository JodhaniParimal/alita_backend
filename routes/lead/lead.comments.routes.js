
const express = require("express")
const { addLeadComments, updateLeadComments, deleteLeadComments, getAllLeadComments } = require("../../controllers/lead/lead.comments.controller")

const leadCommentsRouter = express.Router()

leadCommentsRouter.get('/list-lead-comments', getAllLeadComments)

leadCommentsRouter.post('/add-lead-comments', addLeadComments)

leadCommentsRouter.put('/update-lead-comments/:id', updateLeadComments)

leadCommentsRouter.delete('/delete-lead-comments/:id', deleteLeadComments)

module.exports = { leadCommentsRouter }