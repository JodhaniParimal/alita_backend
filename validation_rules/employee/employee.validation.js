const { checkSchema } = require("express-validator");
const { AUTH_MESSAGES } = require("../../controller-messages/auth.messages");
const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.messages");
const Employee = require("../../models/employee/employee.model");
const { checkColumn } = require("../../helpers/fn");
const { ENUMS } = require("../../constants/enum.constants");
const Roles = require("../../models/role/role.model");
const Department = require("../../models/department/department.model");

const addEmployeeValidation = () => {
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
            AUTH_MESSAGES.EMAIL_UNIQUE,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
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

    role_id: {
      exists: {
        errorMessage: AUTH_MESSAGES.ROLE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.ROLE_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Roles,
            "_id",
            value,
            "",
            AUTH_MESSAGES.ROLE_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    department_id: {
      exists: {
        errorMessage: AUTH_MESSAGES.DEPARTMENT_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: AUTH_MESSAGES.DEPARTMENT_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Department,
            "_id",
            value,
            "",
            AUTH_MESSAGES.DEPARTMENT_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

module.exports = {
  addEmployeeValidation,
};
