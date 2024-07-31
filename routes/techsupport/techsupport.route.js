const { Router } = require("express");
const {
    addTechSupport,
    updateTechSupport,
    updateTicketStatus,
    listTechSupportEmployee,
    listAllTechSupport,
    deleteTechSupport,
    getOneTechSupport
} = require("../../controllers/tech_support/techsupport.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const techsupportRouter = Router();

// ADD Tech Support
techsupportRouter.post(
    "/create",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_ADD]),
    addTechSupport
);


// GET One Tech Support By Id 
techsupportRouter.get(
    "/onetechsupport/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_EMPLOYEE_VIEW]),
    getOneTechSupport
);


// UPDATE Tech Support for employee
techsupportRouter.put(
    "/update_techsupport/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_EMPLOYEE_UPDATE]),
    updateTechSupport
);


// UPDATE Tech Support ticket_status for IT admin
techsupportRouter.put(
    "/update_ticketstatus/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_UPDATE]),
    updateTicketStatus
);


// GET Tech Support for Login Employee
techsupportRouter.post(
    "/listemployeetechsupport",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_EMPLOYEE_VIEW]),
    listTechSupportEmployee
);


// GET All Tech Support for IT Admin
techsupportRouter.post(
    "/listalltechsupport",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_VIEW]),
    listAllTechSupport
);


// Delete Tech Support
techsupportRouter.put(
    "/delete/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.TECH_SUPPORT_DELETE]),
    deleteTechSupport
);



module.exports = {
    techsupportRouter,
};