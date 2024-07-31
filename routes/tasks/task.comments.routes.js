var express = require("express");
var taskCommentRouter = express.Router();

const {
  addTaskComments,
  updateTaskComment,
  listTaskComments,
  deleteTaskComment,
} = require("../../controllers/tasks/task.comments.controller");

const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const {
  taskCommentValidationRules,
} = require("../../validation_rules/tasks/task.comments.validation");

/* GET TASK COMMENT LISTING */
taskCommentRouter.get(
  "/:task_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_COMMENT_VIEW]),
  listTaskComments
);

/* CREATE NEW TASK COMMENT */
taskCommentRouter.post(
  "/add-task-comment",
  taskCommentValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_COMMENT_ADD]),
  addTaskComments
);

/* UPDATE TASK COMMENT */
taskCommentRouter.put(
  "/update-task-comment/:comment_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_COMMENT_UPDATE]),
  updateTaskComment
);

/* DELETE TASK COMMENT */
taskCommentRouter.delete(
  "/delete-task-comment/:comment_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_COMMENT_DELETE]),
  deleteTaskComment
);

module.exports = { taskCommentRouter };
