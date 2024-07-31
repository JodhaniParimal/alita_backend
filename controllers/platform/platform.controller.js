const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  PLATFORM_MESSAGE,
} = require("../../controller-messages/platform-messages/platform.messages");
const Platform = require("../../models/platform/platform.model");

/* ADD NEW PLATFORM // METHOD: POST */
/* PAYLOAD: {title} */
const addPlatform = async (req, res) => {
  try {
    const { title } = req.body;
    const ExistPlatform = await Platform.findOne({
      title: { $regex: title, $options: "i" },
    });
    const value = title.toLowerCase();
    if (ExistPlatform) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PLATFORM_MESSAGE.PLATFORM_EXIST,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const result = await Platform.create({
        title,
        value,
      });
      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: PLATFORM_MESSAGE.PLATFORM_ADDED,
          data: result,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: PLATFORM_MESSAGE.PLATFORM_NOT_ADDED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
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

/* LIST PLATFORM // METHOD: GET */
const listPlatform = async (req, res) => {
  try {
    let result = await Platform.find({ is_deleted: false }).select({
      _id: 1,
      title: 1,
      value: 1,
    });

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PLATFORM_MESSAGE.PLATFORM_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PLATFORM_MESSAGE.PLATFORM_NOT_FOUND,
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

/* DELETE PLATFORM // METHOD: DELETE // PARAMS: id */
const deletePlatform = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Platform.findByIdAndUpdate(_id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PLATFORM_MESSAGE.PLATFORM_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: PLATFORM_MESSAGE.PLATFORM_NOT_DELETED,
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
  addPlatform,
  listPlatform,
  deletePlatform,
};
