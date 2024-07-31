const { Router } = require("express");
const {
  addEmployeeActivityEventLogs,
  updateEmployeeActivityEventLogs,
  listEmployeeActivityEventLogs,
  listSelectedEmployeeActivityEventLogs,
} = require("../../controllers/logs/employee.activity.event.logs.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const {
  addActivityEventValidationRules,
} = require("../../validation_rules/logs/employee.activity.event.logs.validation");
const { validateApi } = require("../../middlewares/validator");

const activityEventRouter = Router();

/* ADD EMPLOYEE ACTIVITY EVENT LOGS*/
activityEventRouter.post(
  "/create",
  addActivityEventValidationRules(),
  validateApi,
  // authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ACTIVITY_EVENT_LOG_ADD]),
  addEmployeeActivityEventLogs
);

/* UPDATE EMPLOYEE ACTIVITY EVENT LOGS*/
activityEventRouter.put(
  "/update/:activity_id",
  // authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ACTIVITY_EVENT_LOG_UPDATE]),
  updateEmployeeActivityEventLogs
);

/* LIST EMPLOYEE ACTIVITY EVENT LOGS*/
activityEventRouter.get(
  "/list",
  // authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ACTIVITY_EVENT_LOG_VIEW]),
  listEmployeeActivityEventLogs
);

/* LIST EMPLOYEE ACTIVITY EVENT LOGS*/
activityEventRouter.post(
  "/list/:employee_code",
  // authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ACTIVITY_EVENT_LOG_VIEW]),
  listSelectedEmployeeActivityEventLogs
);

module.exports = {
  activityEventRouter,
};
