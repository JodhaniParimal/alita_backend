var express = require("express");
var employeeRouter = express.Router();

var { employeeRouters } = require("./employee.route");
var { employeeContactRouter } = require("./employee.contact.details.route");
var { employeeFamilyRouter } = require("./employee.family.details.route");
var { employeeOfficeRouter } = require("./employee.office.details.route");
var { employeeDocumentRouter } = require("./employee.documents.route");

employeeRouter.use("/", employeeRouters);
employeeRouter.use("/contact-details", employeeContactRouter);
employeeRouter.use("/family-details", employeeFamilyRouter);
employeeRouter.use("/office-details", employeeOfficeRouter);
employeeRouter.use("/document", employeeDocumentRouter);

module.exports = { employeeRouter };
