const express = require("express");
const {
  addEmployeeProject,
  listEmployeeProjectCode,
} = require("../../controllers/project/employee.project.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

const empProjectRouter = new express.Router();

/* LIST EMPLOYEE PROJECT_CODE BY EMPLOYEE_CODE*/
empProjectRouter.get(
  "/list-employee-projects/:employee_code",
  listEmployeeProjectCode
);

/* ADD EMPLOYEE_PROJECT*/
empProjectRouter.post(
  "/add-employee-projects",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_PROJECT_ADD]),
  addEmployeeProject
);

module.exports = { empProjectRouter };
