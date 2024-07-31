const { Router } = require("express");
const {
  addEmployeeSkillRating,
  updateEmployeeSkillRating,
  getOneEmployeeSkillRating,
  deleteEmployeeSkillRating,
} = require("../../controllers/behaviouralSkillset/employee.skill.ratings.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const employeeSkillRatingRouter = Router();

/* ADD SKILL RATING*/
employeeSkillRatingRouter.post(
  "/create",
  authPermissions([
    ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD,
    ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE,
  ]),
  addEmployeeSkillRating
);

/* UPDATE SKILL RATING BY ID*/
employeeSkillRatingRouter.put(
  "/update/:_id",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE]),
  updateEmployeeSkillRating
);

/* LIST SKILL RATING BY EMPLOYEE_CODE*/
employeeSkillRatingRouter.get(
  "/all_skill_rating/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  getOneEmployeeSkillRating
);

/* DELETE SKILL RATING*/
employeeSkillRatingRouter.put(
  "/delete/:_id",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmployeeSkillRating
);

module.exports = {
  employeeSkillRatingRouter,
};
