const io = require("../../bin/www");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  TECHNOLOGY_MESSAGE,
} = require("../../controller-messages/technology-messages/technology.messages");
const Technology = require("../../models/technology/technology.model");

/* ADD NEW TECHNOLOGY // METHOD: POST */
/* PAYLOAD: { title } */
const addTechnology = async (req, res) => {
  try {
    const { title } = req.body;
    const ExistTechnology = await Technology.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
      is_deleted: false,
    });
    const value = title.toLowerCase();
    if (ExistTechnology) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECHNOLOGY_MESSAGE.TECHNOLOGY_EXIST,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const technology = await Technology.create({
        title,
        value,
      });
      if (technology) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TECHNOLOGY_MESSAGE.TECHNOLOGY_ADDED,
          data: technology,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: TECHNOLOGY_MESSAGE.TECHNOLOGY_NOT_ADDED,
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

/* UPDATE TECHNOLOGY // METHOD: PUT // PARAMS: id */
/* PAYLOAD: { title } */
const updateTechnology = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const value = title.toLowerCase();
    const ExistTechnology = await Technology.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });
    if (ExistTechnology) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECHNOLOGY_MESSAGE.TECHNOLOGY_EXIST,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const technology = await Technology.findByIdAndUpdate(id, {
        title,
        value,
      });
      if (technology) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TECHNOLOGY_MESSAGE.TECHNOLOGY_UPDATE,
          data: null,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: TECHNOLOGY_MESSAGE.TECHNOLOGY_NOT_UPDATE,
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

/* LIST TECHNOLOGY // METHOD: GET */
const listTechnology = async (req, res) => {
  try {
    let result = await Technology.find({ is_deleted: false }).select({
      _id: 1,
      title: 1,
      value: 1,
    });

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECHNOLOGY_MESSAGE.TECHNOLOGY_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECHNOLOGY_MESSAGE.TECHNOLOGY_NOT_FOUND,
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

/* DELETE TECHNOLOGY // METHOD: DELETE // PARAMS: _id */
const deleteTechnology = async (req, res) => {
  try {
    const { _id } = req.params;

    let result = await Technology.findByIdAndDelete(_id);

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECHNOLOGY_MESSAGE.TECHNOLOGY_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TECHNOLOGY_MESSAGE.TECHNOLOGY_NOT_DELETED,
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
  addTechnology,
  updateTechnology,
  listTechnology,
  deleteTechnology,
};
