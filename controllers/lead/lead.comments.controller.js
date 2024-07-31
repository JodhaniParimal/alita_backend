const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  LEAD_MESSAGES,
} = require("../../controller-messages/lead-messages/lead.messages");
const { Lead_Comments } = require("../../models/lead/lead.comments.model");
const { Lead } = require("../../models/lead/lead.model");

/* ADD NEW LEAD COMMENTS // METHOD: POST */
/* PAYLOAD: lead_code, tech_comment */
const addLeadComments = async (req, res) => {
  try {
    const { lead_code, tech_comment } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    if (lead_code) {
      const lead = await Lead.findOne({ lead_code: lead_code });

      if (!lead || lead.lead_code !== lead_code) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: LEAD_MESSAGES.LEAD_CODE_NOT_MATCH,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    const leadComments = await Lead_Comments.create({
      lead_code: lead_code,
      tech_comment: tech_comment,
      employee_code: employee_code,
    });

    if (leadComments) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_COMMENTS_CREATED,
        data: leadComments,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: LEAD_MESSAGES.LEAD_COMMENTS_NOT_CREATED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (err) {
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

/* UPDATE LEAD COMMENT // METHOD: PUT */
/* PAYLOAD: lead_code, tech_comment */
const updateLeadComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { lead_code, tech_comment } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    const lead_code_check = await Lead.findOne({ lead_code: lead_code });

    if (lead_code_check) {
      const leadComments = await Lead_Comments.findOneAndUpdate({
        _id: id,
        employee_code: employee_code
      },
        {
          lead_code: lead_code,
          tech_comment: tech_comment,
          employee_code: employee_code,
          updated_by: employee_code,
        },
        { new: true }
      );

      if (leadComments) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAD_MESSAGES.LEAD_COMMENTS_UPDATED,
          data: leadComments,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: LEAD_MESSAGES.LEAD_COMMENTS_NOT_UPDATED_FOR_OTHER,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_NOT_FOUND,
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

/* DELETE LEAD COMMENTS // METHOD: DELETE in PARAMS id */
const deleteLeadComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    const deletedLeadComments = await Lead_Comments.findOneAndUpdate({
      _id: id,
      employee_code: employee_code
    },
      {
        is_deleted: true,
        deleted_by: employee_code,
      });
    if (deletedLeadComments) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_COMMENTS_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAD_MESSAGES.LEAD_COMMENTS_NOT_DELETED_FOR_OTHER,
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

/* LIST ALL LEAD COMMENTS // METHOD: GET in PARAMS id */
const getAllLeadComments = async (req, res) => {
  try {
    const leadComments = await Lead_Comments.find().sort({ createdAt: -1 });
    if (leadComments) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_COMMENTS_FOUND,
        data: leadComments,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_COMMENTS_NOT_FOUND,
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

module.exports = {
  addLeadComments,
  updateLeadComments,
  deleteLeadComments,
  getAllLeadComments,
};
