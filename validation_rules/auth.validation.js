const { checkSchema } = require("express-validator");
const { AUTH_MESSAGES } = require("../controller-messages/auth.messages");
const { checkColumn } = require("../helpers/fn");
const Employee = require("../models/employee/employee.model");
const { ENUMS } = require("../constants/enum.constants");

const loginValidationRules = () => {
  return checkSchema({
    email: {
      exists: {
        errorMessage: AUTH_MESSAGES.EMAIL_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.EMAIL_ERROR_EMPTY,
      },
      isEmail: {
        errorMessage: AUTH_MESSAGES.EMAIL_ERROR_INVALID,
      },
    },

    password: {
      exists: {
        errorMessage: AUTH_MESSAGES.PASSWORD_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.PASSWORD_ERROR_EMPTY,
      },
    },
  });
};

const forgetPasswordValidationRules = () => {
  return checkSchema({
    email: {
      exists: {
        errorMessage: AUTH_MESSAGES.EMAIL_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.EMAIL_ERROR_EMPTY,
      },
      isEmail: {
        errorMessage: AUTH_MESSAGES.EMAIL_ERROR_INVALID,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Employee,
            "email",
            value,
            "",
            AUTH_MESSAGES.USER_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS,
            true
          );
        },
      },
    },
  });
};

const resetPasswordValidationRules = () => {
  return checkSchema({
    password: {
      exists: {
        errorMessage: AUTH_MESSAGES.PASSWORD_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.PASSWORD_ERROR_EMPTY,
      },
    },
    token: {
      exists: {
        errorMessage: AUTH_MESSAGES.TOKEN_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.TOKEN_ERROR_EMPTY,
      },
    },
  });
};

const resetMasterPasswordValidationRules = () => {
  return checkSchema({
    new_password: {
      exists: {
        errorMessage: AUTH_MESSAGES.NEW_PASSWORD_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.NEW_PASSWORD_ERROR_EMPTY,
      },
    },
    current_password: {
      exists: {
        errorMessage: AUTH_MESSAGES.CURRENT_PASSWORD_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.CURRENT_PASSWORD_ERROR_EMPTY,
      },
    },
  });
};

module.exports = {
  loginValidationRules,
  forgetPasswordValidationRules,
  resetPasswordValidationRules,
  resetMasterPasswordValidationRules,
};
