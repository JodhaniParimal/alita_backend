const { checkSchema } = require("express-validator");
const {
  TIME_RANGE_MESSAGE,
} = require("../../controller-messages/behaviouralSkillset-messages/employee.time.range.messages");

const saveTimeRangeValidation = () => {
  return checkSchema({
    from_time: {
      isString: {
        errorMessage: TIME_RANGE_MESSAGE.FROM_TIME_INVALID,
      },
      notEmpty: {
        errorMessage: TIME_RANGE_MESSAGE.FROM_TIME_EMPTY,
      },
    },

    to_time: {
      isString: {
        errorMessage: TIME_RANGE_MESSAGE.TO_TIME_INVALID,
      },
      notEmpty: {
        errorMessage: TIME_RANGE_MESSAGE.TO_TIME_EMPTY,
      },
    },
  });
};

module.exports = {
  saveTimeRangeValidation,
};
