const { checkSchema } = require("express-validator");
const {
  EMP_GROUP_MESSAGE,
} = require("../../controller-messages/group-messages/employee.group.messages");
const { checkColumn } = require("../../helpers/fn");
const Group = require("../../models/group/group.model");
const Employee = require("../../models/employee/employee.model");
const { ENUMS } = require("../../constants/enum.constants");

const empGroupValidationRules = () => {
  return checkSchema({
    employee_code: {
      exists: {
        errorMessage: EMP_GROUP_MESSAGE.EMP_CODE_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: EMP_GROUP_MESSAGE.EMP_CODE_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Employee,
            "employee_code",
            value,
            "",
            EMP_GROUP_MESSAGE.EMP_CODE_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
    group_id: {
      exists: {
        errorMessage: EMP_GROUP_MESSAGE.GROUP_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: EMP_GROUP_MESSAGE.GROUP_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Group,
            "_id",
            value,
            "",
            EMP_GROUP_MESSAGE.GROUP_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

module.exports = {
  empGroupValidationRules,
};
