var express = require("express");
var mainDashboardRoute = express.Router();

const { validateApi } = require("../../middlewares/validator");
const {
    listEmployeeBirthday,
    listEmployeeLeaveDashBoard
} = require("../../controllers/dashboard/main.dashboard.controller");



/* GET ALL EMPLOYEE BIRTHDAY */
mainDashboardRoute.get("/all/birthday", validateApi, listEmployeeBirthday);
mainDashboardRoute.get("/all/leave", validateApi, listEmployeeLeaveDashBoard);

module.exports = { mainDashboardRoute };
