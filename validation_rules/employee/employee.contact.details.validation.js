const { checkSchema } = require("express-validator");
const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.contact.details.messages");

const saveEmployeeContactValidation = () => {
  return checkSchema({
    emergency_numbers: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBERS_EMPTY,
      },
      isArray: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBERS_INVALID,
      },
      custom: {
        options: (value) => {
          return new Promise((resolve, reject) => {
            if (value.length >= 2) {
              resolve();
            } else {
              reject(EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBERS_LENGTH);
            }
          });
        },
      },
    },
    "emergency_numbers.*.name": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_NAME_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_NAME_INVALID,
      },
    },
    "emergency_numbers.*.relation": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_RELATION_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_RELATION_INVALID,
      },
    },
    "emergency_numbers.*.location": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_LOCATION_EMPTY,
      },
      isString: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_LOCATION_INVALID,
      },
    },
    "emergency_numbers.*.phone_number": {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_PHONE_EMPTY,
      },
      isMobilePhone: {
        options: ["any", { strictMode: true }],
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_CONT_PHONE_INVALID,
      },
    },
    address: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_ADDRESS_EMPTY,
      },
      isObject: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_ADDRESS_INVALID,
      },
    },

    // "address.current_address": {
    //   notEmpty: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_CURRENT_ADDRESS_EMPTY,
    //   },
    //   isString: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_CURRENT_ADDRESS_INVALID,
    //   },
    // },

    // "address.permanent_address": {
    //   notEmpty: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PERMANENT_ADDRESS_EMPTY,
    //   },
    //   isString: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PERMANENT_ADDRESS_INVALID,
    //   },
    // },

    // "address.state": {
    //   notEmpty: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_STATE_EMPTY,
    //   },
    //   isString: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_STATE_INVALID,
    //   },
    // },

    // "address.city": {
    //   notEmpty: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_CITY_EMPTY,
    //   },
    //   isString: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_CITY_INVALID,
    //   },
    // },

    // "address.pincode": {
    //   notEmpty: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PINCODE_EMPTY,
    //   },
    //   isNumeric: {
    //     errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PINCODE_INVALID,
    //   },
    // },

    phone_number: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PHONE_EMPTY,
      },
      isMobilePhone: {
        options: ["any", { strictMode: true }],
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PHONE_INVALID,
      },
    },
    alternative_phone_number: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_ALT_PHONE_EMPTY,
      },
      isMobilePhone: {
        options: ["any", { strictMode: true }],
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_ALT_PHONE_INVALID,
      },
      // custom: {
      //   options: (value, { req }) => value == req.body.alternative_phone_number,
      //   errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_ALT_PHONE_UNIQUE,
      // },
    },
  });
};

module.exports = {
  saveEmployeeContactValidation,
};
