var express = require("express");
var employeeFamilyRouter = express.Router();

const {
  saveEmployeeFamilyDetails,
  getEmployeeFamilyDetails,
  deleteOneDetail,
  deleteEmployeeFamilyDetails,
  updateOneFamilyDetail,
} = require("../../controllers/employee/employee.family.details.controller");

const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* ADD/UPDATE EMPLOYEE FAMILY DETAILS */
employeeFamilyRouter.post(
  "/save-family-details/:employee_code",
  authPermissions([
    ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD,
    ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE,
  ]),
  saveEmployeeFamilyDetails
);

/* Listing EMPLOYEE FAMILY DETAILS */
employeeFamilyRouter.get(
  "/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  getEmployeeFamilyDetails
);

/*Delete One EMPLOYEE FAMILY DETAILS */
employeeFamilyRouter.delete(
  "/delete/:id/:detailId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteOneDetail
);

/* DELETE EMPLOYEE FAMILY DETAILS BASED ON employee_code */
employeeFamilyRouter.delete(
  "/delete-family-details/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmployeeFamilyDetails
);

/*UPDATE One EMPLOYEE FAMILY DETAILS */
employeeFamilyRouter.put(
  "/update/:id/:detailId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE]),
  updateOneFamilyDetail
);

module.exports = { employeeFamilyRouter };
