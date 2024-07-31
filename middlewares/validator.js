const { validationResult } = require("express-validator");
const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_VALIDATION_ERROR,
  AUTH_USER_DETAILS,
} = require("../constants/global.constants");

const {
  EMPLOYEE_MESSAGE,
} = require("../controller-messages/employee-messages/employee.messages");

const validateApi = (req, res, next) => {
  const error = validationResult(req);

  if (error.isEmpty()) {
    return next();
  }
  const extractedErrors = {};
  error
    .array({ onlyFirstError: true })
    .map((err) => (extractedErrors[err.path] = err.msg));
  const responsePayload = {
    status: RESPONSE_PAYLOAD_STATUS_ERROR,
    message: null,
    data: null,
    error: extractedErrors,
  };

  return res
    .status(RESPONSE_STATUS_CODE_VALIDATION_ERROR)
    .json(responsePayload);
};

const routeValidator = (isLoggedInUser, condition) => {
  return async (req, res, next) => {
    try {
      if (isLoggedInUser) {
        req.body = { ...req.body, condition };
      }
      return next();
    } catch (error) {
      console.log(error);
    }
  };
};

module.exports = {
  validateApi,
  routeValidator,
};
