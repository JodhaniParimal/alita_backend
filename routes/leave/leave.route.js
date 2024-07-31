const { Router } = require("express");
const {
    addLeave,
    updateLeaveStatus,
    updateLeave,
    deleteLeave,
    listAllLeave,
    listLeaveEmployee,
    getOneLeave,
    checkShortLeave,
    teamLeaveList
} = require("../../controllers/leave/leave.controller");
const { authPermissions, allLeavePermissionChecker } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const leaveRouter = Router();

/* GET ONE LEAVE*/
leaveRouter.get(
    "/one-leave/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_VIEW]),
    getOneLeave
);

/* ADD LEAVE*/
leaveRouter.post(
    "/create",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_ADD]),
    addLeave
);

/* UPDATE LEAVE STATUS FOR HR*/
leaveRouter.put(
    "/update-leave-status/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_EMPLOYEE_UPDATE]),
    updateLeaveStatus
);

/* UPDATE LEAVE FOR EMPLOYEE*/
leaveRouter.put(
    "/employee-leave-update/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_UPDATE]),
    updateLeave
);

/* DELETE LEAVE*/
leaveRouter.put(
    "/delete/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_DELETE]),
    deleteLeave
);

/* LIST ALL EMPLOYEE LEAVE */
leaveRouter.post(
    "/list-allleave",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_EMPLOYEE_VIEW]),
    // allLeavePermissionChecker,
    listAllLeave
);

/* LIST EMPLOYEE LEAVE */
leaveRouter.post(
    "/employee-leavelist",
    authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_VIEW]),
    listLeaveEmployee
);

/* LIST EMPLOYEE LEAVE */
leaveRouter.get(
    "/employee-shortleave",
    // authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_VIEW]),
    checkShortLeave
);

/* LIST TEAM LEAVE */
leaveRouter.post(
    "/team-leave",
    // authPermissions([ENUMS.PERMISSION_TYPE.LEAVE_VIEW]),
    teamLeaveList
);


module.exports = {
    leaveRouter,
};
