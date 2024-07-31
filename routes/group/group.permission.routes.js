var express = require("express");
var groupPermissionRouter = express.Router();

const {
  listGroupPermissionById,
  updateGroupPermission,
  deleteGroupPermission,
  listGroupPermission,
  addGroupPermission,
} = require("../../controllers/group/group.permission.controller");

const {
  groupPermissionValidationRules,
  updateGroupPermissionValidationRules,
} = require("../../validation_rules/group/group.permission.validation");
const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* GET GROUP PERMISSION LISTING BY GROUP ID */
groupPermissionRouter.get(
  "/:group_id",
  authPermissions([
    ENUMS.PERMISSION_TYPE.GROUP_VIEW,
    ENUMS.PERMISSION_TYPE.PERMISSION_VIEW,
  ]),
  listGroupPermissionById
);

/* GET ALL GROUP PERMISSION LISTING */
groupPermissionRouter.post(
  "/all-group-permission",
  authPermissions([
    ENUMS.PERMISSION_TYPE.GROUP_VIEW,
    ENUMS.PERMISSION_TYPE.PERMISSION_VIEW,
  ]),
  listGroupPermission
);

/* CREATE NEW GROUP PERMISSION */
groupPermissionRouter.post(
  "/add-group-permission",
  groupPermissionValidationRules(),
  validateApi,
  addGroupPermission
);

/* UPDATE EXISTING GROUP PERMISSION */
groupPermissionRouter.put(
  "/update-group-permission",
  updateGroupPermissionValidationRules(),
  validateApi,
  authPermissions([
    ENUMS.PERMISSION_TYPE.GROUP_UPDATE,
    ENUMS.PERMISSION_TYPE.PERMISSION_UPDATE,
  ]),
  updateGroupPermission
);

/* DELETE EXISTING GROUP PERMISSION */
groupPermissionRouter.delete(
  "/delete-group-permission",
  groupPermissionValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.GROUP_DELETE]),
  deleteGroupPermission
);

module.exports = { groupPermissionRouter };
