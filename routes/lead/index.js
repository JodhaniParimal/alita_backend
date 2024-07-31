const { Router } = require("express");
const { leadRouter } = require("./lead.routes");
const { leadCommentsRouter } = require("./lead.comments.routes");
const { summariesRouter } = require("./summaries.routes");
const { attachmentRouter } = require("./attachment.routes");

const leadIndex = new Router();

leadIndex.use("/lead", leadRouter);

leadIndex.use('/comments', leadCommentsRouter)

leadIndex.use('/summaries', summariesRouter)

leadIndex.use('/attachment', attachmentRouter)

module.exports = { leadIndex }