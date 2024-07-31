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
} = require("../../controller-messages/employee-messages/employee.family.details.messages");

const Employee_Family_Details = require("../../models/employee/employee.family.details.model");
const Employee = require("../../models/employee/employee.model");
const { checkExistingEmployee } = require("./employee.controller");

/* ADD/UPDATE EMPLOYEE FAMILY DETAILS //  METHOD: POST */
const saveEmployeeFamilyDetails = async (req, res) => {
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

    const existingFamilyDetails = await Employee_Family_Details.findOne({
      employee_code: employee_code,
      is_deleted: false,
    });
    let result;
    if (existingFamilyDetails) {
      createObj = { ...createObj, updated_by: auth_employee_code };
      result = await Employee_Family_Details.findOneAndUpdate(
        { employee_code: employee_code, is_deleted: false },
        createObj,
        { new: true }
      );
    } else {
      createObj = { ...createObj, created_by: auth_employee_code };
      result = await Employee_Family_Details.create({
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

/* GET EMPLOYEE FAMILY DETAILS BY employee_code in PARAMS // METHOD: GET */
const getEmployeeFamilyDetails = async (req, res) => {
  try {
    const { employee_code } = req.params;
    let result = await Employee_Family_Details.findOne({
      employee_code: employee_code,
      is_deleted: false,
    }).select({ employee_code: 1, details: 1, created_date: 1 });

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

/* DELETE EMPLOYEE FAMILY DETAILS BY employee_code in PARAMS // METHOD: DELETE */
const deleteEmployeeFamilyDetails = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;

    const employeeUpdated = await Employee_Family_Details.findOneAndUpdate(
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

/* DELETE EMPLOYEE FAMILY DETAILS BY ObjID and detail ObjID in PARAMS // METHOD: DELETE */
const deleteOneDetail = async (req, res) => {
  try {
    const { id, detailId } = req.params;
    const result = await Employee_Family_Details.updateOne(
      { _id: id },
      {
        $pull: {
          details: { _id: detailId },
        },
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_DELETED,
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

/* UPDATE EMPLOYEE EMERGENCY NUMBER BY ObjID and detail ObjID in PARAMS // METHOD: UPDATE */
const updateOneFamilyDetail = async (req, res) => {
  try {
    const { id, detailId } = req.params;
    const Req_obj = { ...req.body };
    let updateObject = {};

    for (const key in Req_obj) {
      if (Object.hasOwnProperty.call(Req_obj, key)) {
        const value = Req_obj[key];
        updateObject[`details.$.${key}`] = value;
      }
    }

    const result = await Employee_Family_Details.updateOne(
      { _id: id, "details._id": detailId },
      {
        $set: updateObject,
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_ALREADY_UPDATED,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FAMILY_DETAILS_UPDATED,
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
  saveEmployeeFamilyDetails,
  getEmployeeFamilyDetails,
  deleteOneDetail,
  deleteEmployeeFamilyDetails,
  updateOneFamilyDetail,
};
