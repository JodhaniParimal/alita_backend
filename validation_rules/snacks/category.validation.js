const { checkSchema } = require("express-validator");
const {
  CATEGORY_MESSAGE,
} = require("../../controller-messages/snacks-messages/category.messages");
const { checkColumn } = require("../../helpers/fn");
const { ENUMS } = require("../../constants/enum.constants");
const { Snacks_Category } = require("../../models/snacks/category.model");

const addCategoryValidationRules = () => {
  return checkSchema({
    name: {
      exists: {
        errorMessage: CATEGORY_MESSAGE.CATEGORY_NAME_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: CATEGORY_MESSAGE.CATEGORY_NAME_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Snacks_Category,
            "name",
            value,
            "",
            CATEGORY_MESSAGE.CATEGORY_EXIST,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
      },
    },
  });
};

module.exports = {
  addCategoryValidationRules,
};
