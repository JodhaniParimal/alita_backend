var express = require("express");
var taskRouter = express.Router();

const {
  addTask,
  listTasks,
  changeTaskStatus,
  updateTask,
  deleteTask,
  listTasksById,
  deleteTaskHard,
  addTaskByExcelFile,
  getAllTasksForDone,
  makeTasksDone,
  listAllTasks,
  allEmployeeTaskInfotracker,
  teamTaskList,
  listTaskHour,
  checkTaskDate,
} = require("../../controllers/tasks/tasks.controller");

const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const {
  taskValidationRules,
  changeTaskStatusValidationRules,
  getTaskValidationRules,
} = require("../../validation_rules/tasks/tasks.validation");
const { uploadTaskExcel } = require("../../services/fileUpload");

/* GET ALL TASKS which is  Ready to QA TASK LISTING by EXCEL */
taskRouter.get(
  "/get-tasks-for-done/:filename",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_VIEW]),
  getAllTasksForDone
);

/* MAKE ALL TASKS DONE */
taskRouter.post(
  "/make-tasks-done",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_UPDATE]),
  makeTasksDone
);

/* GET TASK LISTING */
taskRouter.post(
  "/get-tasks",
  getTaskValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_VIEW]),
  listTasks
);

/* GET TASK HOUR FOR EMPLOYEE */
taskRouter.post(
  "/task-hour-list",
  // changeTaskStatusValidationRules(),
  // validateApi,
  // authPermissions([ENUMS.PERMISSION_TYPE.TASK_UPDATE]),
  listTaskHour
);

/* GET TASK LISTING */
taskRouter.post(
  "/get-all-tasks",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_VIEW]),
  listAllTasks
);

/* GET Employee TASK INFO LISTING */
taskRouter.post(
  "/employee-task-info",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_VIEW]),
  allEmployeeTaskInfotracker
);

/* GET ONE TASK */
taskRouter.get(
  "/one_task/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_VIEW]),
  listTasksById
);

/* CREATE NEW TASK */
taskRouter.post(
  "/add-task",
  taskValidationRules(),
  validateApi,
  authPermissions([
    ENUMS.PERMISSION_TYPE.TASK_ADD,
    ENUMS.PERMISSION_TYPE.TASK_EMPLOYEE_ADD,
  ]),
  addTask
);

// /* CHECK TASK */
// taskRouter.post(
//   "/check-task",
//   // authPermissions([
//   //   ENUMS.PERMISSION_TYPE.TASK_ADD,
//   //   ENUMS.PERMISSION_TYPE.TASK_EMPLOYEE_ADD,
//   // ]),
//   checkTaskDate
// );

/* CREATE NEW TASK BY EXCEL FILE */
taskRouter.post(
  "/add-tasks-by-excel",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_ADD]),
  uploadTaskExcel.single("file"),
  addTaskByExcelFile
);

/* UPDATE TASK STATUS */
taskRouter.put(
  "/update-task-status",
  changeTaskStatusValidationRules(),
  validateApi,
  // authPermissions([ENUMS.PERMISSION_TYPE.TASK_UPDATE]),
  changeTaskStatus
);

/* UPDATE TASK */
taskRouter.put(
  "/update-task/:task_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_UPDATE]),
  updateTask
);

/* DELETE TASK */
taskRouter.delete(
  "/delete-task/:task_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_DELETE]),
  deleteTask
);

/* DELETE TASK HARD */
taskRouter.delete(
  "/delete-task-hard/:task_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TASK_DELETE]),
  deleteTaskHard
);

/* DELETE TASK HARD */
taskRouter.get(
  "/team-task",
  // authPermissions([ENUMS.PERMISSION_TYPE.TASK_DELETE]),
  teamTaskList
);

module.exports = { taskRouter };
