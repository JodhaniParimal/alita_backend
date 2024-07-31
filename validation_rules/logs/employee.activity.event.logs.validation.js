const { checkSchema } = require("express-validator");
const {
  EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE,
} = require("../../controller-messages/log-messages/employee.activity.event.log.messages");
const { checkColumn } = require("../../helpers/fn");
const { ENUMS } = require("../../constants/enum.constants");
const Employee = require("../../models/employee/employee.model");

const addActivityEventValidationRules = () => {
  return checkSchema({
    employee_code: {
      exists: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_CODE_MISSING,
      },
      notEmpty: {
        errorMessage:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_CODE_NOT_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Employee,
            "employee_code",
            value,
            "",
            EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_CODE_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    screenshot: {
      exists: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.SCREENSHOT_MISSING,
      },
      notEmpty: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.SCREENSHOT_NOT_EMPTY,
      },
    },
    events: {
      exists: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_MISSING,
      },
      notEmpty: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_NOT_EMPTY,
      },
      isArray: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_NOT_VALID,
      },
    },
    "events.*.mouse": {
      notEmpty: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.MOUSE_EVENT_NOT_EMPTY,
      },
      exists: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.MOUSE_EVENT_MISSING,
      },
    },
    "events.*.keyboard": {
      notEmpty: {
        errorMessage:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.KEYBOARD_EVENT_NOT_EMPTY,
      },
      exists: {
        errorMessage:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.KEYBOARD_EVENT_MISSING,
      },
    },
    "events.*.start_time": {
      notEmpty: {
        errorMessage:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_TIMESTART_NOT_EMPTY,
      },
      exists: {
        errorMessage:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_TIMESTART_MISSING,
      },
    },
    "events.*.end_time": {
      notEmpty: {
        errorMessage:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_TIMEEND_NOT_EMPTY,
      },
      exists: {
        errorMessage: EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EVENT_TIMEEND_MISSING,
      },
    },
  });
};

module.exports = {
  addActivityEventValidationRules,
};
