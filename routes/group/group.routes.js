var express = require("express");
var groupRouters = express.Router();

const {
  listGroups,
  addGroup,
  deleteGroup,
  updateGroup,
} = require("../../controllers/group/group.controller");

const {
  groupValidationRules,
} = require("../../validation_rules/group/group.validation");
const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* GET GROUP LISTING */
groupRouters.get(
  "/",
  authPermissions([ENUMS.PERMISSION_TYPE.GROUP_VIEW]),
  listGroups
);

/* CREATE NEW GROUP */
groupRouters.post(
  "/add-group",
  groupValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.GROUP_ADD]),
  addGroup
);

/* UPDATE GROUP BY _id IN PARAMS */
groupRouters.put(
  "/update-group/:_id",
  groupValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.GROUP_UPDATE]),
  updateGroup
);

/* DELETE GROUP */
groupRouters.delete(
  "/:group_id",
  authPermissions([ENUMS.PERMISSION_TYPE.GROUP_DELETE]),
  deleteGroup
);

module.exports = { groupRouters };
