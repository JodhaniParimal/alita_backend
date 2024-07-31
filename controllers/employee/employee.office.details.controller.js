const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");

const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.office.details.messages");

const Employee_Office_Details = require("../../models/employee/employee.office.details.model");
const Employee = require("../../models/employee/employee.model");
const { checkExistingEmployee } = require("./employee.controller");

/* ADD/UPDATE EMPLOYEE CONTACT DETAILS //  METHOD: POST */
const saveEmployeeOfficeDetails = async (req, res) => {
  let createObj = { ...req.body };
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    let { employee_code } = req.params;

    if (!employee_code) {
      employee_code = auth_employee_code;
    }

    const existingUser = await checkExistingEmployee(employee_code);
    if (!existingUser.status) {
      return res.status(RESPONSE_STATUS_CODE_OK).json(existingUser.res);
    }

    const existingOfficeDetails = await Employee_Office_Details.findOne({
      employee_code: employee_code,
      is_deleted: false,
    });
    let result;
    if (existingOfficeDetails) {
      createObj = { ...createObj, updated_by: auth_employee_code };
      result = await Employee_Office_Details.findOneAndUpdate(
        { employee_code: employee_code, is_deleted: false },
        createObj,
        { new: true }
      );
    } else {
      createObj = { ...createObj, created_by: auth_employee_code };
      result = await Employee_Office_Details.create({
        employee_code,
        ...createObj,
      });
    }

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_SAVED,
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

/* GET EMPLOYEE OFFICE DETAILS BY employee_code in PARAMS // METHOD: GET */
const getEmployeeOfficeDetails = async (req, res) => {
  try {
    const { employee_code } = req.params;
    let result = await Employee_Office_Details.findOne({
      employee_code: employee_code,
      is_deleted: false,
    }).select({
      employee_code: 1,
      shift_time: 1,
      position: 1,
      department: 1,
      year_of_experience: 1,
      past_company_details: 1,
      created_date: 1,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_FOUND,
        data: {},
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

/* DELETE EMPLOYEE PAST COMPANY DETAILS BY ObjID and past_company_details ObjID in PARAMS // METHOD: DELETE */
const deleteOnePastCompny = async (req, res) => {
  try {
    const { id, pastCompanyId } = req.params;
    const result = await Employee_Office_Details.updateOne(
      { _id: id },
      {
        $pull: {
          past_company_details: { _id: pastCompanyId },
        },
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_PAST_COMPANY_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_PAST_COMPANY_DELETED,
        data: null,
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

/* DELETE EMPLOYEE OFFICE DETAILS BY employee_code in PARAMS // METHOD: DELETE */
const deleteEmployeeOfficeDetails = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;

    const employeeUpdated = await Employee_Office_Details.findOneAndUpdate(
      { employee_code: employee_code },
      { is_deleted: true, deleted_by: auth_employee_code },
      { new: true }
    );

    if (employeeUpdated) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_DELETED,
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

/* UPDATE EMPLOYEE  PAST COMPANY DETAILS BY ObjID and past_company_details ObjID in PARAMS // METHOD: UPDATE */
const updateOnePastCompny = async (req, res) => {
  try {
    const { id, pastCompanyId } = req.params;
    const Req_obj = { ...req.body };
    let updateObject = {};

    for (const key in Req_obj) {
      if (Object.hasOwnProperty.call(Req_obj, key)) {
        const value = Req_obj[key];
        updateObject[`past_company_details.$.${key}`] = value;
      }
    }

    const result = await Employee_Office_Details.updateOne(
      { _id: id, "past_company_details._id": pastCompanyId },
      {
        $set: updateObject,
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_PAST_COMPANY_ALREADY_UPDATED,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_PAST_COMPANY_UPDATED,
        data: null,
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

/* DELETE OFFICE SHIFT TIME BY ID and SHIFT_ID in PARAMS // METHOD: DELETE */
const deleteShiftTimeByID = async (req, res) => {
  try {
    const { id, shift_id } = req.params;

    const result = await Employee_Office_Details.updateOne(
      { _id: id },
      {
        $pull: {
          shift_time: { _id: shift_id },
        },
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_SHIFT_TIME_DELETED,
        data: null,
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
module.exports = {
  saveEmployeeOfficeDetails,
  getEmployeeOfficeDetails,
  deleteEmployeeOfficeDetails,
  deleteOnePastCompny,
  updateOnePastCompny,
  deleteShiftTimeByID,
};
