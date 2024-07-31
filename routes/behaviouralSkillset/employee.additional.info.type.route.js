const { Router } = require("express");
const {
  listAdditionalinfoType,
} = require("../../controllers/behaviouralSkillset/employee.additional.info.type.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const employeeAdditionalInfoTypes = Router();

/* LIST ADDITIONAL INFO TYPES*/
employeeAdditionalInfoTypes.get(
  "/list",
  listAdditionalinfoType
);

module.exports = {
  employeeAdditionalInfoTypes,
};
