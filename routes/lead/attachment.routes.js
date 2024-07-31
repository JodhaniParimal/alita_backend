const express = require("express")
const { addAttachments, updateAttachment, deleteAttachment } = require("../../controllers/lead/attachment.controller")
const { uploadAttachment } = require("../../services/fileUpload")

const attachmentRouter = express.Router()

attachmentRouter.post('/add-attachment', uploadAttachment.single("path"), addAttachments)

attachmentRouter.put('/update-attachment/:id', uploadAttachment.single("path"), updateAttachment)

attachmentRouter.delete('/delete-attachment/:id', deleteAttachment)

module.exports = { attachmentRouter }