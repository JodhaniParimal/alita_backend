const express = require("express");
const {
  addEmpHours, updateEmpHours, getEmpHoursById,
} = require("../../controllers/project/employeeHours.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const addEmployeeHoursRouter = new express.Router();

addEmployeeHoursRouter.post(
  "/add-employee-hours",
  authPermissions([ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT]),
  addEmpHours
);

addEmployeeHoursRouter.put(
  "/update-employee-hours/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT]),
  updateEmpHours
);

addEmployeeHoursRouter.get(
  "/get-employee-hours/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT]),
  getEmpHoursById
);

module.exports = { addEmployeeHoursRouter };
