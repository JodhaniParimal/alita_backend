var express = require("express");
var employeeOfficeRouter = express.Router();

const {
  saveEmployeeOfficeDetails,
  getEmployeeOfficeDetails,
  deleteOnePastCompny,
  deleteEmployeeOfficeDetails,
  updateOnePastCompny,
  deleteShiftTimeByID,
} = require("../../controllers/employee/employee.office.details.controller");

const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* ADD/UPDATE EMPLOYEE OFFICE DETAILS */
employeeOfficeRouter.post(
  "/save-office-details/:employee_code",
  authPermissions([
    ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD,
    ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE,
  ]),
  saveEmployeeOfficeDetails
);

/* Listing EMPLOYEE OFFICE DETAILS */
employeeOfficeRouter.get(
  "/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  getEmployeeOfficeDetails
);

/*DELETE One EMPLOYEE PAST COMPANY DETAILS */
employeeOfficeRouter.delete(
  "/delete/:id/:pastCompanyId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteOnePastCompny
);

/* DELETE EMPLOYEE OFFICE DETAILS BASED ON employee_code */
employeeOfficeRouter.delete(
  "/delete-office-details/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmployeeOfficeDetails
);

/*UPDATE One EMPLOYEE PAST COMPANY DETAILS */
employeeOfficeRouter.put(
  "/update/:id/:pastCompanyId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  updateOnePastCompny
);

/* DELETE SHIFT TIME BY PARANT OBJ ID AND CHILD OBJ ID*/
employeeOfficeRouter.delete(
  "/delete-shift/:id/:shift_id",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteShiftTimeByID
);

module.exports = { employeeOfficeRouter };
