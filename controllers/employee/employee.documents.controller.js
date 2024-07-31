const bcrypt = require("bcryptjs");

const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  AUTH_USER_DETAILS,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");

const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.documents.messages");

const Employee_Documents = require("../../models/employee/employee.documents.model");
const Employee = require("../../models/employee/employee.model");
const { checkExistingEmployee } = require("./employee.controller");

/* GET DOCUMENTS OF EMPLOYEE BY EMPLOYEE_CODE IN PARAMS;  METHOD GET */
const getEmployeeDocumentByEmpCode = async (req, res) => {
  try {
    const { employee_code } = req.params;
    const result = await Employee_Documents.findOne({
      employee_code: employee_code,
    }).select({ created_by: 0, updated_by: 0, updated_date: 0 });

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
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
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

/* ADD EMPLOYEE DOCUMENT if not, and if exists update Docs // METHOD: PUT with formdata */
/* PAYLOAD: {pan_card_number,aadhar_card_number,pan_card_image,aadhar_card_image } */
/* PARAMS: {employee_code } */
const saveEmployeeDocument = async (req, res) => {
  try {
    const { certificates, documents } = req.body;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    let { employee_code } = req.params;

    if (!employee_code) {
      employee_code = auth_employee_code;
    }

    let updatedObj = { ...req.body, updated_by: auth_employee_code, $push: {} };

    const existingUser = await checkExistingEmployee(employee_code);
    if (!existingUser.status) {
      return res.status(RESPONSE_STATUS_CODE_OK).json(existingUser.res);
    }

    if (req.files?.length) {
      const files = req.files;
      for (let index = 0; index < files.length; index++) {
        const element = files[index];

        if (certificates && certificates.length > 0) {
          certificates.forEach((e) => {
            if (element.originalname.includes(e.name)) {
              e["image"] = `/images/certificates` + "/" + element.filename;
            }
          });
          updatedObj.$push["certificates"] = certificates;
        }

        if (documents && documents.length > 0) {
          documents.forEach((e) => {
            if (element.originalname.includes(e.name)) {
              e["image"] = `/images/documents` + "/" + element.filename;
            }
          });
          updatedObj.$push["documents"] = documents;
        }
      }
    }
    delete updatedObj.certificates, delete updatedObj.documents;

    const existingDocs = await Employee_Documents.findOne({ employee_code });
    let result;
    if (existingDocs) {
      result = await Employee_Documents.findOneAndUpdate(
        { employee_code: employee_code },
        updatedObj,
        { new: true }
      );
    } else {
      result = await Employee_Documents.create({
        employee_code: employee_code,
        certificates: certificates,
        documents: documents,
        created_by: auth_employee_code,
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

/* DELETE EMPLOYEE DOCUMENT BY document_id in PARAMS // METHOD: DELETE */
const deleteEmployeeDocument = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { document_id } = req.params;

    const employeeUpdated = await Employee_Documents.findByIdAndUpdate(
      document_id,
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

/* DELETE EMPLOYEE DOCUMENTS BY ObjID and document/certificates ObjID in PARAMS // METHOD: DELETE */
const deleteOneFileById = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const result = await Employee_Documents.updateOne(
      { _id: id },
      {
        $pull: {
          certificates: { _id: fileId },
          documents: { _id: fileId },
        },
      }
    );
    if (result.modifiedCount === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_RECORD_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_RECORD_DELETED,
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
  saveEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocumentByEmpCode,
  deleteOneFileById,
};
