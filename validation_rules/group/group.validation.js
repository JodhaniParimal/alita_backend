const { checkSchema } = require("express-validator");
const {
  GROUP_MESSAGE,
} = require("../../controller-messages/group-messages/group.messages");
const { checkColumn } = require("../../helpers/fn");
const Group = require("../../models/group/group.model");
const { ENUMS } = require("../../constants/enum.constants");

const groupValidationRules = () => {
  return checkSchema({
    title: {
      exists: {
        errorMessage: GROUP_MESSAGE.GROUP_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: GROUP_MESSAGE.GROUP_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Group,
            "title",
            value,
            "",
            GROUP_MESSAGE.GROUP_EXISTS,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
      },
    },
  });
};

module.exports = {
  groupValidationRules,
};
