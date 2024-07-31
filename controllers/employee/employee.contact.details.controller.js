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
} = require("../../controller-messages/employee-messages/employee.contact.details.messages");

const Employee_Contact_Details = require("../../models/employee/employee.contact.details.model");
const Employee = require("../../models/employee/employee.model");
const { checkExistingEmployee } = require("./employee.controller");

/* ADD/UPDATE EMPLOYEE CONTACT DETAILS //  METHOD: POST // PARAMS: employee_code */
const saveEmployeeContactDetails = async (req, res) => {
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

    const existingContact = await Employee_Contact_Details.findOne({
      employee_code: employee_code,
      is_deleted: false,
    });
    let result;
    if (existingContact) {
      createObj = { ...createObj, updated_by: auth_employee_code };
      result = await Employee_Contact_Details.findOneAndUpdate(
        { employee_code: employee_code, is_deleted: false },
        createObj,
        { new: true }
      );
    } else {
      createObj = { ...createObj, created_by: auth_employee_code };
      result = await Employee_Contact_Details.create({
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

/* GET EMPLOYEE CONTACT DETAILS BY employee_code in PARAMS // METHOD: GET */
const getEmployeeContactDetails = async (req, res) => {
  try {
    const { employee_code } = req.params;
    let result = await Employee_Contact_Details.findOne({
      employee_code: employee_code,
      is_deleted: false,
    }).select({
      employee_code: 1,
      emergency_numbers: 1,
      address: 1,
      phone_number: 1,
      alternative_phone_number: 1,
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

/* DELETE EMPLOYEE CONTACT DETAILS BY employee_code in PARAMS // METHOD: DELETE */
const deleteEmployeeContactDetails = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;

    const employeeUpdated = await Employee_Contact_Details.findOneAndUpdate(
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

/* DELETE EMPLOYEE EMERGENCY NUMBER BY ObjID and emergency_number ObjID in PARAMS // METHOD: DELETE */
const deleteEmergencyNumbers = async (req, res) => {
  try {
    const { id, emeNumId } = req.params;
    const result = await Employee_Contact_Details.updateOne(
      { _id: id },
      {
        $pull: {
          emergency_numbers: { _id: emeNumId },
        },
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBER_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBER_DELETED,
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

/* UPDATE EMPLOYEE EMERGENCY NUMBER BY ObjID and emergency_number ObjID in PARAMS // METHOD: UPDATE */
const updateEmergencyNumbers = async (req, res) => {
  try {
    const { id, emeNumId } = req.params;
    const Req_obj = { ...req.body };
    let updateObject = {};

    for (const key in Req_obj) {
      if (Object.hasOwnProperty.call(Req_obj, key)) {
        const value = Req_obj[key];
        updateObject[`emergency_numbers.$.${key}`] = value;
      }
    }
    const result = await Employee_Contact_Details.updateOne(
      { _id: id, "emergency_numbers._id": emeNumId },
      {
        $set: updateObject,
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBER_ALREADY_UPDATED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_EMERGENCY_NUMBER_UPDATED,
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
  saveEmployeeContactDetails,
  deleteEmployeeContactDetails,
  getEmployeeContactDetails,
  deleteEmergencyNumbers,
  updateEmergencyNumbers,
};
