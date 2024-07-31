const { checkSchema } = require("express-validator");
const {
  ROLE_MESSAGE,
} = require("../../controller-messages/role-messages/role.messages");
const { checkColumn } = require("../../helpers/fn");
const Roles = require("../../models/role/role.model");
const { ENUMS } = require("../../constants/enum.constants");

const roleValidationRules = () => {
  return checkSchema({
    role: {
      exists: {
        errorMessage: ROLE_MESSAGE.ROLE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: ROLE_MESSAGE.ROLE_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Roles,
            "role",
            value,
            "",
            ROLE_MESSAGE.ROLE_EXISTS,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
      },
    },
  });
};

module.exports = {
  roleValidationRules,
};
