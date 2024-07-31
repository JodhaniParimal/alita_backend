const express = require("express");
const { projectRouter } = require("./project.routes");
const { addHoursRouter } = require("./addHours.routes");
const { empProjectRouter } = require("./employee.project.routes");
const { addEmployeeHoursRouter } = require("./employeeHours.routes");

const projectIndex = new express.Router();

projectIndex.use("/project", projectRouter);

projectIndex.use("/hours", addHoursRouter);

projectIndex.use("/employee-hours", addEmployeeHoursRouter);

projectIndex.use("/employee-project", empProjectRouter);

module.exports = { projectIndex };
