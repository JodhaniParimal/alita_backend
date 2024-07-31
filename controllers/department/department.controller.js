const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  DEPARTMENT_MESSAGE,
} = require("../../controller-messages/department-messages/department.messages");
const Department = require("../../models/department/department.model");

/* ADD NEW DEPARTMENT // METHOD: POST // PAYLOAD: {title} */
const addDepartment = async (req, res) => {
  try {
    const { title } = req.body;
    const ExistDepartment = await Department.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
      is_deleted: false,
    });
    if (ExistDepartment) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_EXIST,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const department = await Department.create({
        title,
      });
      if (department) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: DEPARTMENT_MESSAGE.DEPARTMENT_ADDED,
          data: department,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: DEPARTMENT_MESSAGE.DEPARTMENT_NOT_ADDED,
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

/* UPDATE DEPARTMENT // METHOD: PUT // PAYLOAD: {title} // PARAMS: id */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const ExistDepartment = await Department.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });
    if (ExistDepartment) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_EXIST,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const department = await Department.findByIdAndUpdate(id, {
        title,
      });
      if (department) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: DEPARTMENT_MESSAGE.DEPARTMENT_UPDATE,
          data: null,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: DEPARTMENT_MESSAGE.DEPARTMENT_NOT_UPDATE,
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

/* LIST DEPARTMENT // METHOD: GET */
const listDepartment = async (req, res) => {
  try {
    let result = await Department.find({ is_deleted: false }).select({
      _id: 1,
      title: 1,
    });

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_NOT_FOUND,
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
// LIST Department BY ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await Department.findById(id).select({
      _id: 1,
      title: 1,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_NOT_FOUND,
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

/* DELETE DEPARTMENT // METHOD: DELETE // PARAMS: id */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Department.findByIdAndUpdate(id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DEPARTMENT_MESSAGE.DEPARTMENT_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: DEPARTMENT_MESSAGE.DEPARTMENT_NOT_DELETED,
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
  addDepartment,
  updateDepartment,
  listDepartment,
  deleteDepartment,
  getDepartmentById,
};
