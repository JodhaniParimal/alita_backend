const moment = require("moment");

const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  TASK_COMMENT_MESSAGE,
} = require("../../controller-messages/tasks-messages/task.comments.messages");
const Employee = require("../../models/employee/employee.model");
const { Task_Comments } = require("../../models/tasks/task.comments.model");

/* LIST ALL COMMENTS OF TASK by task_id in PARAMS // METHOD: GET // PARAMS: task_id */
const listTaskComments = async (req, res) => {
  try {
    const { task_id } = req.params;
    let result = await Task_Comments.find({
      is_deleted: false,
      task_id: task_id,
    }).select({
      is_deleted: 0,
      is_disabled: 0,
      updated_by: 0,
      deleted_by: 0,
    });

    if (result.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_COMMENT_MESSAGE.TASK_COMMENT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_COMMENT_MESSAGE.TASK_COMMENT_NOT_FOUND,
        data: [],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* ADD NEW TASK COMMENT // METHOD: POST // PAYLOAD: comment, task_id */
const addTaskComments = async (req, res) => {
  try {
    const { comment, task_id } = req.body;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const employee_name = await Employee.aggregate([
      {
        $match: { employee_code: auth_employee_code },
      },
      {
        $project: {
          name: { $concat: ["$firstname", " ", "$lastname"] },
        },
      },
      {
        $group: {
          _id: null,
          names: { $push: "$name" },
        },
      },
      {
        $project: {
          _id: 0,
          names: { $arrayElemAt: ["$names", 0] },
        },
      },
    ]);

    let result = await Task_Comments.create({
      comment: comment,
      task_id: task_id,
      name: employee_name[0].names,
      commented_by: auth_employee_code,
      created_by: auth_employee_code,
      created_date: moment().format(),
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_COMMENT_MESSAGE.TASK_COMMENT_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: TASK_COMMENT_MESSAGE.TASK_COMMENT_NOT_SAVED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* UPDATE TASK COMMENT // METHOD: PUT in PARAMS: comment_id */
const updateTaskComment = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { comment_id } = req.params;
    const employee_name = await Employee.aggregate([
      {
        $match: { employee_code: auth_employee_code },
      },
      {
        $project: {
          name: { $concat: ["$firstname", " ", "$lastname"] },
        },
      },
      {
        $group: {
          _id: null,
          names: { $push: "$name" },
        },
      },
      {
        $project: {
          _id: 0,
          names: { $arrayElemAt: ["$names", 0] },
        },
      },
    ]);
    const updatedObj = {
      ...req.body,
      name: employee_name[0].names,
      updated_by: auth_employee_code,
      updated_date: moment().format(),
    };

    let result = await Task_Comments.findByIdAndUpdate(comment_id, updatedObj, {
      new: true,
    });
    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_COMMENT_MESSAGE.TASK_COMMENT_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_COMMENT_MESSAGE.TASK_COMMENT_NOT_SAVED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* DELETE TASK // METHOD: DELETE in PARAMS: comment_id */
const deleteTaskComment = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { comment_id } = req.params;

    let result = await Task_Comments.findByIdAndUpdate(
      comment_id,
      { is_deleted: true, deleted_by: auth_employee_code },
      {
        new: true,
      }
    );

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_COMMENT_MESSAGE.TASK_COMMENT_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_COMMENT_MESSAGE.TASK_COMMENT_NOT_DELETED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

module.exports = {
  addTaskComments,
  updateTaskComment,
  listTaskComments,
  deleteTaskComment,
};
