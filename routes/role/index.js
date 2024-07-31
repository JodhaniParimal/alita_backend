var express = require("express");
var roleRouter = express.Router();

var { roleRouters } = require("./role.routes");

roleRouter.use("/", roleRouters);

module.exports = { roleRouter };
