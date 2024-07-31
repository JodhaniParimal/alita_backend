var express = require("express");
var employeeContactRouter = express.Router();

const {
  saveEmployeeContactDetails,
  deleteEmployeeContactDetails,
  getEmployeeContactDetails,
  deleteEmergencyNumbers,
  updateEmergencyNumbers,
} = require("../../controllers/employee/employee.contact.details.controller");

const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* ADD/UPDATE EMPLOYEE CONTACT DETAILS */
employeeContactRouter.post(
  "/save-contact-details/:employee_code",
  authPermissions([
    ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD,
    ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE,
  ]),
  saveEmployeeContactDetails
);

/* Listing EMPLOYEE CONTACT DETAILS */
employeeContactRouter.get(
  "/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  getEmployeeContactDetails
);

/* DELETE EMPLOYEE CONTACT DETAILS BASED ON employee_code */
employeeContactRouter.delete(
  "/delete-contact-details/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmployeeContactDetails
);

/*DELETE One EMPLOYEE EMERGENCY_NUMBER DETAILS */
employeeContactRouter.delete(
  "/delete/:id/:emeNumId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmergencyNumbers
);

/*UPDATE One EMPLOYEE EMERGENCY_NUMBER DETAILS */
employeeContactRouter.put(
  "/update/:id/:emeNumId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE]),
  updateEmergencyNumbers
);

module.exports = { employeeContactRouter };
