const { ENUMS } = require("../../constants/enum.constants");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR
} = require("../../constants/global.constants");
const { EMPLOYEE_MESSAGE } = require("../../controller-messages/employee-messages/employee.messages");

/*Employee status*/
const employeeStatus = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS.EMPLOYEE_STATUS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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

/*Lead status*/
const leadStatus = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS.LEAD_STATUS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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

/*Project status*/
const projectStatus = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS.PROJECT_STATUS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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

/*Task status*/
const taskStatus = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS.TASK_STATUS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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

/*Leave status*/
const leaveStatus = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS.LEAVE_STATUS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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

/*Order status*/
const orderStatus = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS.ORDER_STATUS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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

/*All ENUM_CONSTANTS*/
const allENUM = async (req, res) => {
  try {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: EMPLOYEE_MESSAGE.STATUS_FOUND,
      data: ENUMS,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);

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
  employeeStatus,
  leadStatus,
  projectStatus,
  taskStatus,
  leaveStatus,
  orderStatus,
  allENUM
};
