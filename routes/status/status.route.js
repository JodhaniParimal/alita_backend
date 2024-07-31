const { Router } = require("express");
const {
    employeeStatus,
    leadStatus,
    projectStatus,
    taskStatus,
    leaveStatus,
    orderStatus,
    allENUM
} = require("../../controllers/status/status.controller");
const statusRouter = Router();

/* Employee Status*/
statusRouter.get("/employee_status", employeeStatus);
statusRouter.get("/lead_status", leadStatus);
statusRouter.get("/project_status", projectStatus);
statusRouter.get("/task_status", taskStatus);
statusRouter.get("/leave_status", leaveStatus);
statusRouter.get("/order_status", orderStatus);
statusRouter.get("/all_enum", allENUM);

module.exports = {
    statusRouter,
};
