const { Router } = require("express");
const { employeeSkillRatingRouter } = require("./employee.skill.ratings.route")
const { empSkillRouter } = require("./employee.skill.route");
const { employeeAdditionalInfo } = require("./employee.additional.info.route");
const { employeeAdditionalInfoTypes } = require("./employee.additional.info.type.route");

const allbehaviouralRouter = new Router();



allbehaviouralRouter.use('/employee_skill', empSkillRouter);
allbehaviouralRouter.use('/employee_skill_rating', employeeSkillRatingRouter);
allbehaviouralRouter.use('/employee_additional_info', employeeAdditionalInfo);
allbehaviouralRouter.use('/additional_info_types', employeeAdditionalInfoTypes);


module.exports = { allbehaviouralRouter };
