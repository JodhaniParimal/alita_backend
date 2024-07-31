var express = require("express");
var employeeGroupRouter = express.Router();

const {
  saveEmployeeGroup,
  listEmployeeGroups,
  listAllEmployeeGroups,
} = require("../../controllers/group/employee.group.controller");

const {
  empGroupValidationRules,
} = require("../../validation_rules/group/employee.group.validation");
const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* LIST EMPLOYEE GROUP with PERMISSIONS */
employeeGroupRouter.get(
  "/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_GROUP_VIEW]),
  listEmployeeGroups
);

/* LIST EMPLOYEEE_GROUP*/
employeeGroupRouter.post(
  "/employee-group/all",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_GROUP_VIEW]),
  listAllEmployeeGroups
);

/* ADD/UPDATE EMPLOYEE GROUP */
employeeGroupRouter.post(
  "/add-employee-group",
  empGroupValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_GROUP_UPDATE]),
  saveEmployeeGroup
);

module.exports = { employeeGroupRouter };
