const { checkSchema } = require("express-validator");
const {
  GROUP_PERMISSION_MESSAGE,
} = require("../../controller-messages/group-messages/group.permission.messages");
const { checkColumn } = require("../../helpers/fn");
const Group = require("../../models/group/group.model");
const Permission = require("../../models/group/permission.model");
const { ENUMS } = require("../../constants/enum.constants");

const groupPermissionValidationRules = () => {
  return checkSchema({
    group_id: {
      exists: {
        errorMessage: GROUP_PERMISSION_MESSAGE.GROUP_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: GROUP_PERMISSION_MESSAGE.GROUP_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Group,
            "_id",
            value,
            "",
            GROUP_PERMISSION_MESSAGE.GROUP_ERROR_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    permission_id: {
      exists: {
        errorMessage: GROUP_PERMISSION_MESSAGE.PERMISSION_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: GROUP_PERMISSION_MESSAGE.PERMISSION_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Permission,
            "_id",
            value,
            "",
            GROUP_PERMISSION_MESSAGE.PERMISSION_ERROR_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

const updateGroupPermissionValidationRules = () => {
  return checkSchema({
    group_id: {
      exists: {
        errorMessage: GROUP_PERMISSION_MESSAGE.GROUP_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: GROUP_PERMISSION_MESSAGE.GROUP_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Group,
            "_id",
            value,
            "",
            GROUP_PERMISSION_MESSAGE.GROUP_ERROR_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    permissions: {
      exists: {
        errorMessage: GROUP_PERMISSION_MESSAGE.PERMISSIONS_MISSING,
      },
      notEmpty: {
        errorMessage: GROUP_PERMISSION_MESSAGE.PERMISSIONS_EMPTY,
      },
      isArray: {
        errorMessage: GROUP_PERMISSION_MESSAGE.PERMISSIONS_INVALID,
      },
    },
  });
};

module.exports = {
  groupPermissionValidationRules,
  updateGroupPermissionValidationRules,
};
