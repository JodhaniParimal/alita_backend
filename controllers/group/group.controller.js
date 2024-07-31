const {
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
} = require("../../constants/global.constants");
const {
  GROUP_MESSAGE,
} = require("../../controller-messages/group-messages/group.messages");
const Group = require("../../models/group/group.model");

/* LIST ALL GROUPS // METHOD: GET */
const listGroups = async (req, res) => {
  try {
    let result = await Group.find({ is_deleted: false }).select({
      _id: 1,
      title: 1,
    });

    if (result.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_MESSAGE.GROUP_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_MESSAGE.GROUP_NOT_FOUND,
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

/* ADD NEW GROUP // METHOD: POST // PAYLOAD: {title} */
const addGroup = async (req, res) => {
  try {
    const { title } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Group.create({
      title: title,
      created_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_MESSAGE.GROUP_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: GROUP_MESSAGE.GROUP_NOT_SAVED,
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

/* UPDATE GROUP // METHOD: PUT // PAYLOAD: {title} // PARAMS: _id */
const updateGroup = async (req, res) => {
  try {
    const { _id } = req.params;
    const { title } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Group.findByIdAndUpdate(
      _id,
      {
        title: title,
        updated_by: employee_code,
      },
      { new: true }
    );

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_MESSAGE.GROUP_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: GROUP_MESSAGE.GROUP_NOT_SAVED,
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

/* DELETE GROUP // METHOD: DELETE // PARAMS: group_id */
const deleteGroup = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Group.findByIdAndUpdate(group_id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_MESSAGE.GROUP_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: GROUP_MESSAGE.GROUP_NOT_DELETED,
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
  listGroups,
  addGroup,
  updateGroup,
  deleteGroup,
};
