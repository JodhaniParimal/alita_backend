const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  EMPLOYEE_INFO_TYPE_MESSAGE,
} = require("../../controller-messages/behaviouralSkillset-messages/employee.additional.info.types.messages");
const Additional_Info_Types = require("../../models/behaviour/additional.info.types.model");

/* LIST Additional Info Type // METHOD: GET */
const listAdditionalinfoType = async (req, res) => {
  try {
    let result = await Additional_Info_Types.find({ is_deleted: false }).select(
      {
        _id: 1,
        title: 1,
      }
    );

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_INFO_TYPE_MESSAGE.EMPLOYEE_INFO_TYPE_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: EMPLOYEE_INFO_TYPE_MESSAGE.EMPLOYEE_INFO_TYPE_NOT_FOUND,
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
  listAdditionalinfoType,
};
