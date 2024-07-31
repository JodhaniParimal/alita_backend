const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  PERMISSION_MESSAGE,
} = require("../../controller-messages/group-messages/permission.messages");
const Permission = require("../../models/group/permission.model");

/* LIST ALL PERMISSION // METHOD: GET */
const listPermissions = async (req, res) => {
  try {
    let result = await Permission.find({ is_deleted: false }).select({
      _id: 1,
      name: 1,
    });

    if (result.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PERMISSION_MESSAGE.PERMISSION_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PERMISSION_MESSAGE.PERMISSION_NOT_FOUND,
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

/* ADD NEW PERMISSION // METHOD: POST // PAYLOAD: name */
const addPermission = async (req, res) => {
  try {
    const { name } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Permission.create({
      name: name,
      created_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PERMISSION_MESSAGE.PERMISSION_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: PERMISSION_MESSAGE.PERMISSION_NOT_SAVED,
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

/* Update PERMISSION // METHOD: PUT // PAYLOAD: name // PARAMS: _id */
const updatePermission = async (req, res) => {
  try {
    const { _id } = req.params;
    const { name } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Permission.findByIdAndUpdate(
      _id,
      {
        name: name,
        updated_by: employee_code,
      },
      { new: true }
    );

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PERMISSION_MESSAGE.PERMISSION_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: PERMISSION_MESSAGE.PERMISSION_NOT_SAVED,
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

/* DELETE PERMISSION // METHOD: DELETE // PARAMS: permission_id */
const deletePermission = async (req, res) => {
  try {
    const { permission_id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Permission.findByIdAndUpdate(permission_id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PERMISSION_MESSAGE.PERMISSION_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: PERMISSION_MESSAGE.PERMISSION_NOT_DELETED,
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

/* ADD MODULE PERMISSION // METHOD: POST // PAYLOAD: module */
const addModulePermission = async (req, res) => {
  try {
    const { module } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let newArr = [
      {
        name: `${module}-view`,
        created_by: employee_code,
      },
      {
        name: `${module}-add`,
        created_by: employee_code,
      },
      {
        name: `${module}-update`,
        created_by: employee_code,
      },
      {
        name: `${module}-delete`,
        created_by: employee_code,
      },
    ];

    let result = await Permission.create(newArr);
    if (result.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PERMISSION_MESSAGE.PERMISSION_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: PERMISSION_MESSAGE.PERMISSION_NOT_SAVED,
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
  addPermission,
  updatePermission,
  listPermissions,
  deletePermission,
  addModulePermission,
};
