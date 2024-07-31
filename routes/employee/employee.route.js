var express = require("express");
var employeeRouters = express.Router();

const { validateApi } = require("../../middlewares/validator");

const {
  getEmployeeByCode,
  listAllEmployees,
  listEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  listTLPM,
  listEmployeeDepartment,
  updateEmployeeRole,
  employeeTrackerTokenNull,
  allEmployeeTrackerTokenNull,
  updateEmployeeDepartment,
  listEmployeesForTeam,
} = require("../../controllers/employee/employee.controller");

const {
  addEmployeeValidation,
} = require("../../validation_rules/employee/employee.validation");

const { profilePicUpload } = require("../../services/fileUpload");
const { authPermissions, itSupportAllEmployee } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* GET ALL EMPLOYEE listing for dropdown */
employeeRouters.get(
  "/",
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW, ENUMS.PERMISSION_TYPE.TEAM_ADD]),
  listEmployees
);

/* GET ALL EMPLOYEE listing for team search dropdown */
employeeRouters.get(
  "/team/employee",
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.TEAM_ADD]),
  listEmployeesForTeam
);

/* GET ALL EMPLOYEE DEPARTMENT listing for dropdown */
employeeRouters.get(
  "/all-employee-department",
  validateApi,
  listEmployeeDepartment
);

/* GET ALL EMPLOYEE listing with pagination, searching and sorting */
employeeRouters.post(
  "/all-employees",
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  itSupportAllEmployee,
  listAllEmployees
);

/* GET ONE EMPLOYEE BASED ON EMPLOYEE_CODE */
employeeRouters.get(
  "/:employee_code",
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  getEmployeeByCode
);

/* GET ONE EMPLOYEE BASED ON EMPLOYEE_CODE */
employeeRouters.get("/get/tl-pm", validateApi, listTLPM);

/* ADD EMPLOYEE */
employeeRouters.post(
  "/add-employee",
  addEmployeeValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD]),
  addEmployee
);

/* UPDATE EMPLOYEE BASED ON EMPLOYEE_CODE */
employeeRouters.put(
  "/update-employee/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE]),
  profilePicUpload.single("file"),
  updateEmployee
);

/* UPDATE EMPLOYEE ROLE */
employeeRouters.put("/update-employee-role/:employee_code", updateEmployeeRole);

/* UPDATE EMPLOYEE DEPARTMENT */
employeeRouters.put("/department-update-employee/:employee_code", updateEmployeeDepartment);

/* DELETE EMPLOYEE BASED ON EMPLOYEE_CODE */
employeeRouters.delete(
  "/delete-employee/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmployee
);

/* NULL TRACKER TOKEN*/
employeeRouters.put("/all-tracker-token-null", allEmployeeTrackerTokenNull);
employeeRouters.get(
  "/update-tracker-token/:employee_code",
  employeeTrackerTokenNull
);

module.exports = { employeeRouters };
