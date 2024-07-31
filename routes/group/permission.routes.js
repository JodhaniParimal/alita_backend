var express = require("express");
var permissionRouter = express.Router();

const {
  addPermission,
  listPermissions,
  deletePermission,
  updatePermission,
  addModulePermission,
} = require("../../controllers/group/permission.controller");
const {
  permissionValidationRules,
  modulePermissionValidationRules,
} = require("../../validation_rules/group/permission.validation");
const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* GET PERMISSION LISTING */
permissionRouter.get(
  "/",
  authPermissions([ENUMS.PERMISSION_TYPE.PERMISSION_VIEW]),
  listPermissions
);

/* CREATE NEW PERMISSION */
permissionRouter.post(
  "/add-permission",
  permissionValidationRules(),
  validateApi,
  addPermission
);

/* CREATE MODULE PERMISSION */
permissionRouter.post(
  "/add-module-permission",
  modulePermissionValidationRules(),
  validateApi,
  addModulePermission
);

/* UPDATE PERMISSION */
permissionRouter.put(
  "/update-permission/:_id",
  permissionValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.PERMISSION_UPDATE]),
  updatePermission
);

/* DELETE PERMISSION */
permissionRouter.delete("/:permission_id", deletePermission);

module.exports = { permissionRouter };
