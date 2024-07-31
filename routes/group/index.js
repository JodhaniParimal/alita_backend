var express = require("express");
var groupRouter = express.Router();

var { groupRouters } = require("./group.routes");
var { permissionRouter } = require("./permission.routes");
var { groupPermissionRouter } = require("./group.permission.routes");
var { employeeGroupRouter } = require("./employee.group.routes");

groupRouter.use("/", groupRouters);
groupRouter.use("/permission", permissionRouter);
groupRouter.use("/group-permission", groupPermissionRouter);
groupRouter.use("/employee-group", employeeGroupRouter);

module.exports = { groupRouter };
