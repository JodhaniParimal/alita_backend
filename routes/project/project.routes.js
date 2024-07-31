const express = require("express");
const {
  addProject,
  updateProject,
  listProject,
  listProjectById,
  listProjectCode,
  addEstimatedHours,
  getListProject,
  listEmployeeProjects,
  listEmployeeByProjectCode,
} = require("../../controllers/project/project.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const {
  addProjectValidation,
} = require("../../validation_rules/project/addProject.validation");
const { validateApi } = require("../../middlewares/validator");
const {
  updateProjectValidation,
} = require("../../validation_rules/project/updateProject.validation");
const { ENUMS } = require("../../constants/enum.constants");

const projectRouter = new express.Router();

/* LIST PROJECT*/
projectRouter.post(
  "/list-project",
  authPermissions([ENUMS.PERMISSION_TYPE.PROJECT_VIEW]),
  listProject
);

/* LIST PROJECT BY ID*/
projectRouter.get(
  "/list-project/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.PROJECT_VIEW]),
  listProjectById
);

/* LIST EMPLOYEE_PROJECT*/
projectRouter.post(
  "/employee-list-project",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_PROJECT_VIEW]),
  listEmployeeProjects
);

/* LIST EMPLOYEE_PROJECT BY ID*/
projectRouter.get(
  "/employee-list-project/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_PROJECT_VIEW]),
  listProjectById
);

/* LIST EMPLOYEE BY PROJECT CODE*/
projectRouter.get(
  "/list-employees-by-projectcode/:project_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_PROJECT_VIEW]),
  listEmployeeByProjectCode
);

/* ADD PROJECT*/
projectRouter.post(
  "/add-project",
  addProjectValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.PROJECT_ADD]),
  addProject
);

/* UPDATE PROJECT BY ID*/
projectRouter.put(
  "/employee-update-project/:id",
  updateProjectValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_PROJECT_UPDATE]),
  updateProject
);

/* UPDATE PROJECT BY ID*/
projectRouter.put(
  "/update-project/:id",
  updateProjectValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.PROJECT_UPDATE]),
  updateProject
);

projectRouter.get("/list-project-code", listProjectCode);

projectRouter.get("/get-list-project", getListProject);

projectRouter.put("/add-estimated-hours/:project_code", addEstimatedHours);

module.exports = { projectRouter };
