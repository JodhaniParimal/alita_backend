const { Router } = require("express");
const {
  addupdateAdditionalinfo,
  listEmployeeAdditionalInfo,
} = require("../../controllers/behaviouralSkillset/employee.additional.info.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const employeeAdditionalInfo = Router();

/* ADD AND UPDATE ADDITIONAL INFO*/
employeeAdditionalInfo.post(
  "/create",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD]),
  addupdateAdditionalinfo
);

/* LIST ADDITIONAL INFO*/
employeeAdditionalInfo.get(
  "/list/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  listEmployeeAdditionalInfo
);

module.exports = {
  employeeAdditionalInfo,
};
