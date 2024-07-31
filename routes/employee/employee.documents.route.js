var express = require("express");
var employeeDocumentRouter = express.Router();

const {
  saveEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocumentByEmpCode,
  deleteOneFileById,
} = require("../../controllers/employee/employee.documents.controller");

const { uploadDocuments } = require("../../services/fileUpload");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* ADD/Update EMPLOYEE DOCUMENT */
employeeDocumentRouter.post(
  "/save-document/:employee_code",
  authPermissions([
    ENUMS.PERMISSION_TYPE.EMPLOYEE_ADD,
    ENUMS.PERMISSION_TYPE.EMPLOYEE_UPDATE,
  ]),
  uploadDocuments.array("files"),
  saveEmployeeDocument
);

/* Listing EMPLOYEE DOCUMENTS BASED ON EMPLOYEE_CODE */
employeeDocumentRouter.get(
  "/:employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  getEmployeeDocumentByEmpCode
);

/* DELETE EMPLOYEE DOCUMENTS BASED ON Document_id */
employeeDocumentRouter.delete(
  "/delete-document/:document_id",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteEmployeeDocument
);

/*DELETE One EMPLOYEE DOCUMENTS DETAILS */
employeeDocumentRouter.delete(
  "/delete/:id/:fileId",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_DELETE]),
  deleteOneFileById
);

module.exports = { employeeDocumentRouter };
