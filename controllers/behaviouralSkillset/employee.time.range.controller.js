const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
} = require("../../constants/global.constants");
const {
  TIME_RANGE_MESSAGE,
} = require("../../controller-messages/behaviouralSkillset-messages/employee.time.range.messages");

const {
  Employee_Time_Range,
} = require("../../models/behaviour/employee.time.range.model");
const Employee = require("../../models/employee/employee.model");
const { checkExistingEmployee } = require("../employee/employee.controller");

/* ADD EMPLOYEE TIME RANGE // METHOD: POST // PAYLOAD: {from_time, to_time} // PARAMS: employee_code */
const saveEmployeeTimeRange = async (req, res) => {
  try {
    const { employee_code } = req.params;
    const { from_time, to_time } = req.body;

    const existingUser = await checkExistingEmployee(employee_code);
    if (!existingUser.status) {
      return res.status(RESPONSE_STATUS_CODE_OK).json(existingUser.res);
    }

    const existingTimeRange = await Employee_Time_Range.findOne({
      employee_code,
    });
    let result;
    if (existingTimeRange) {
      result = await Employee_Time_Range.findOneAndUpdate(
        { employee_code: employee_code },
        {
          from_time,
          to_time,
          updated_by: existingUser._id,
        },
        { new: true }
      );

      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TIME_RANGE_MESSAGE.TIME_RANGE_UPDATED,
          data: result,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: TIME_RANGE_MESSAGE.TIME_RANGE_NOT_UPDATED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      result = await Employee_Time_Range.create({
        employee_code,
        from_time,
        to_time,
      });

      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TIME_RANGE_MESSAGE.TIME_RANGE_ADDED,
          data: result,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: TIME_RANGE_MESSAGE.TIME_RANGE_NOT_ADDED,
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

module.exports = {
  saveEmployeeTimeRange,
};
