const { Router } = require("express");
const empSkillRouter = Router();
const {
  addEmployeeSkill,
  employeeSkillListingForDropdown,
} = require("../../controllers/behaviouralSkillset/employee.skill.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* LIST SKILL FOR DROPDOWN*/
empSkillRouter.get(
  "/listing",
  employeeSkillListingForDropdown
);

module.exports = { empSkillRouter };
