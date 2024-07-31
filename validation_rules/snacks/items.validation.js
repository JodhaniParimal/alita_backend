const { checkSchema } = require("express-validator");
const {
  ITEMS_MESSAGE,
} = require("../../controller-messages/snacks-messages/items.messages");
const { checkColumn } = require("../../helpers/fn");
const { ENUMS } = require("../../constants/enum.constants");
const { Snacks_Items } = require("../../models/snacks/items.model");
const { Snacks_Category } = require("../../models/snacks/category.model");

const addItemsValidationRules = () => {
  return checkSchema({
    name: {
      exists: {
        errorMessage: ITEMS_MESSAGE.ITEMS_NAME_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: ITEMS_MESSAGE.ITEMS_NAME_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Snacks_Items,
            "name",
            value,
            "",
            ITEMS_MESSAGE.ITEMS_EXIST,
            ENUMS.VALIDATION_TYPE.UNIQUE,
            true
          );
        },
      },
    },

    category_id: {
      exists: {
        errorMessage: ITEMS_MESSAGE.CATEGORY_ID_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: ITEMS_MESSAGE.CATEGORY_ID_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Snacks_Category,
            "_id",
            value,
            "",
            ITEMS_MESSAGE.CATEGORY_EXIST,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

module.exports = {
  addItemsValidationRules,
};
