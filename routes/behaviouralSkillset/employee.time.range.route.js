const { Router } = require("express");
const {
  saveEmployeeTimeRange,
} = require("../../controllers/behaviouralSkillset/employee.time.range.controller");
const { validateApi } = require("../../middlewares/validator");
const {
  saveTimeRangeValidation,
} = require("../../validation_rules/behaviour/employee.time.range.validation");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const timeRangeRouter = Router();

/* ADD AND UPDATE TIME RANGE*/
timeRangeRouter.post(
  "/:employee_code",
  saveTimeRangeValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD]),
  saveEmployeeTimeRange
);

module.exports = {
  timeRangeRouter,
};
