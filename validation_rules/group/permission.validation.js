const { checkSchema } = require("express-validator");
const {
  PERMISSION_MESSAGE,
} = require("../../controller-messages/group-messages/permission.messages");
const { checkColumn } = require("../../helpers/fn");
const Permission = require("../../models/group/permission.model");
const { ENUMS } = require("../../constants/enum.constants");

const permissionValidationRules = () => {
  return checkSchema({
    name: {
      exists: {
        errorMessage: PERMISSION_MESSAGE.PERMISSION_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: PERMISSION_MESSAGE.PERMISSION_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Permission,
            "name",
            value,
            "",
            PERMISSION_MESSAGE.PERMISSION_EXISTS,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
      },
    },
  });
};

const modulePermissionValidationRules = () => {
  return checkSchema({
    module: {
      exists: {
        errorMessage: PERMISSION_MESSAGE.PERMISSION_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: PERMISSION_MESSAGE.PERMISSION_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Permission,
            "name",
            value,
            "",
            PERMISSION_MESSAGE.PERMISSION_EXISTS,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
      },
    },
  });
};

module.exports = {
  permissionValidationRules,
  modulePermissionValidationRules,
};
