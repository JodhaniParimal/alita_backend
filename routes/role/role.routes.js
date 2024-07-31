var express = require("express");
var roleRouters = express.Router();

const {
  listRoles,
  addRole,
  deleteRole,
  listRolesDropDown,
} = require("../../controllers/role/role.controller");

const {
  roleValidationRules,
} = require("../../validation_rules/role/role.validation");
const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* POST ROLE LISTING */
roleRouters.post(
  "/",
  authPermissions([ENUMS.PERMISSION_TYPE.ROLE_VIEW]),
  listRoles
);

/* GET ROLE LISTING */
roleRouters.get(
  "/dropdown",
  authPermissions([ENUMS.PERMISSION_TYPE.ROLE_VIEW]),
  listRolesDropDown
);

/* CREATE NEW ROLE */
roleRouters.post(
  "/add-role",
  roleValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.ROLE_ADD]),
  addRole
);

/* DELETE ROLE */
roleRouters.delete(
  "/:role_id",
  authPermissions([ENUMS.PERMISSION_TYPE.ROLE_DELETE]),
  deleteRole
);

module.exports = { roleRouters };
