const { checkSchema } = require("express-validator");
const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.family.details.messages");

const saveEmployeeFamilyValidation = () => {
  return checkSchema({
    details: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_EMPTY,
      },
      isArray: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_INVALID,
      },
      custom: {
        options: (value) => {
          return new Promise((resolve, reject) => {
            if (value.length > 0) {
              resolve();
            } else {
              reject(EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_LENGTH);
            }
          });
        },
      },
    },
    "details.*.name": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_NAME_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_NAME_INVALID,
      },
    },
    "details.*.relation": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_RELATION_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_RELATION_INVALID,
      },
    },
    "details.*.occupation": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_OCCUPATION_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_OCCUPATION_INVALID,
      },
    },
    "details.*.personal_phone_number": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_PHONE_EMPTY,
      },
      isMobilePhone: {
        options: ["any", { strictMode: true }],
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DET_PHONE_INVALID,
      },
    },
  });
};

module.exports = {
  saveEmployeeFamilyValidation,
};
