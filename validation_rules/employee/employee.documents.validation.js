const { checkSchema } = require("express-validator");
const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee.documents.messages");

const addEmployeeDocumentValidation = () => {
  return checkSchema({
    pan_card_number: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PAN_CARD_EMPTY,
      },
      isAlphanumeric: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_PAN_CARD_INVALID,
      },
    },

    aadhar_card_number: {
      notEmpty: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_AADHAR_CARD_EMPTY,
      },
      isNumeric: {
        errorMessage: EMPLOYEE_MESSAGE.EMPLOYEE_AADHAR_CARD_INVALID,
      },
    },
  });
};

module.exports = {
  addEmployeeDocumentValidation,
};
