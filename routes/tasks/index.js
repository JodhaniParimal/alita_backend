var express = require("express");
var tasksRouter = express.Router();

var { taskRouter } = require("./tasks.routes");
var { taskCommentRouter } = require("./task.comments.routes");

tasksRouter.use("/", taskRouter);
tasksRouter.use("/comments", taskCommentRouter);

module.exports = { tasksRouter };
