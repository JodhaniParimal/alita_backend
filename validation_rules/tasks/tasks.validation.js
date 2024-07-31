const { checkSchema } = require("express-validator");
const {
  TASK_MESSAGE,
} = require("../../controller-messages/tasks-messages/tasks.messages");
const { checkColumn } = require("../../helpers/fn");
const { ENUMS } = require("../../constants/enum.constants");
const { Project } = require("../../models/project/project.model");
const Employee = require("../../models/employee/employee.model");
const { Tasks } = require("../../models/tasks/tasks.model");

const getTaskValidationRules = () => {
  return checkSchema({
    employee_code: {
      exists: {
        errorMessage: TASK_MESSAGE.EMPLOYEE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.EMPLOYEE_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Employee,
            "employee_code",
            value,
            "",
            TASK_MESSAGE.EMPLOYEE_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

const taskValidationRules = () => {
  return checkSchema({
    title: {
      exists: {
        errorMessage: TASK_MESSAGE.TASK_TITLE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.TASK_TITLE_ERROR_EMPTY,
      },
    },
    project_code: {
      exists: {
        errorMessage: TASK_MESSAGE.PROJECT_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.PROJECT_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Project,
            "project_code",
            value,
            "",
            TASK_MESSAGE.PROJECT_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    employee_code: {
      exists: {
        errorMessage: TASK_MESSAGE.EMPLOYEE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.EMPLOYEE_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Employee,
            "employee_code",
            value,
            "",
            TASK_MESSAGE.EMPLOYEE_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

const changeTaskStatusValidationRules = () => {
  return checkSchema({
    employee_code: {
      exists: {
        errorMessage: TASK_MESSAGE.EMPLOYEE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.EMPLOYEE_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Employee,
            "employee_code",
            value,
            "",
            TASK_MESSAGE.EMPLOYEE_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    task_id: {
      exists: {
        errorMessage: TASK_MESSAGE.TASK_ID_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.TASK_ID_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Tasks,
            "_id",
            value,
            "",
            TASK_MESSAGE.TASK_ID_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    status_from: {
      exists: {
        errorMessage: TASK_MESSAGE.TASK_STATUS_FROM_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.TASK_STATUS_FROM_ERROR_EMPTY,
      },
    },
    status_to: {
      exists: {
        errorMessage: TASK_MESSAGE.TASK_STATUS_TO_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_MESSAGE.TASK_STATUS_TO_ERROR_EMPTY,
      },
    },
  });
};

module.exports = {
  getTaskValidationRules,
  taskValidationRules,
  changeTaskStatusValidationRules,
};
