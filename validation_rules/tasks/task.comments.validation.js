const { checkSchema } = require("express-validator");
const {
  TASK_COMMENT_MESSAGE,
} = require("../../controller-messages/tasks-messages/task.comments.messages");
const { checkColumn } = require("../../helpers/fn");
const { ENUMS } = require("../../constants/enum.constants");
const { Tasks } = require("../../models/tasks/tasks.model");

const taskCommentValidationRules = () => {
  return checkSchema({
    comment: {
      exists: {
        errorMessage: TASK_COMMENT_MESSAGE.TASK_COMMENT_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_COMMENT_MESSAGE.TASK_COMMENT_ERROR_EMPTY,
      },
    },
    task_id: {
      exists: {
        errorMessage: TASK_COMMENT_MESSAGE.TASK_ID_ERROR_MISSING,
      },
      notEmpty: {
        errorMessage: TASK_COMMENT_MESSAGE.TASK_ID_ERROR_EMPTY,
      },
      custom: {
        options: (value) => {
          return checkColumn(
            Tasks,
            "_id",
            value,
            "",
            TASK_COMMENT_MESSAGE.TASK_ID_NOT_FOUND,
            ENUMS.VALIDATION_TYPE.EXISTS
          );
        },
      },
    },
  });
};

module.exports = {
  taskCommentValidationRules,
};
