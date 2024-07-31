const { checkSchema } = require("express-validator");
const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.office.details.messages");

const saveEmployeeOfficeValidation = () => {
  return checkSchema({
    shift_time: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_EMPTY,
      },
      isArray: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_INVALID,
      },
      custom: {
        options: (value) => {
          return new Promise((resolve, reject) => {
            if (value.length > 0) {
              resolve();
            } else {
              reject(EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_LENGTH);
            }
          });
        },
      },
    },
    "shift_time.*.start_time": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_START_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_START_INVALID,
      },
    },
    "shift_time.*.end_time": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_END_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_END_INVALID,
      },
    },
    position: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_POSITION_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_POSITION_INVALID,
      },
    },
    department: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_DEPARTMENT_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_DEPARTMENT_INVALID,
      },
    },
    year_of_experience: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_YEAR_OF_EXPERIENCE_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_YEAR_OF_EXPERIENCE_INVALID,
      },
    },
  });
};

module.exports = {
  saveEmployeeOfficeValidation,
};
