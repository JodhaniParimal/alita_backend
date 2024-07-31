const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
} = require("../../constants/global.constants");
const { EMPLOYEE_HOUR_MESSAGE } = require("../../controller-messages/employeehour-messages/employeehour.messages");
const { Employee_Hours } = require("../../models/project/employeeHours.model");
const { default: mongoose } = require("mongoose");

const addEmpHours = async (req, res) => {
  try {
    const { name, number, hour_id } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    const createObj = { name, number, hour_id, created_by: employee_code };
    const added = await Employee_Hours.create(createObj);
    if (added) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_HOUR_MESSAGE.EMPLOYEE_HOUR_ADDED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: null,
        data: null,
        error: EMPLOYEE_HOUR_MESSAGE.EMPLOYEE_HOUR_NOT_ADDED,
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

const updateEmpHours = async (req, res) => {
  try {
    const { id } = req.params;
    // const _id = new mongoose.Types.ObjectId(id);
    const { number, name } = req.body;

    const updateHour = await Employee_Hours.findOneAndUpdate(
      {
        hour_id: id
      },
      {
        number: number,
        name: name,
      },
      { new: true }
    );
    if (updateHour) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_HOUR_MESSAGE.EMPLOYEE_HOUR_UPDATE,
        data: updateHour,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: EMPLOYEE_HOUR_MESSAGE.EMPLOYEE_HOUR_NOT_UPDATE,
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

const getEmpHoursById = async (req, res) => {
  try {
    const { id } = req.params;
    // const _id = new mongoose.Types.ObjectId(id);

    const getEmpHour = await Employee_Hours.findOne(
      {
        hour_id: id
      }
    );
    if (getEmpHour) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_HOUR_MESSAGE.EMPLOYEE_HOUR_FOUND,
        data: getEmpHour,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: EMPLOYEE_HOUR_MESSAGE.EMPLOYEE_HOUR_NOT_FOUND,
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
  addEmpHours,
  updateEmpHours,
  getEmpHoursById
};
