const { default: mongoose } = require("mongoose");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");
const {
  LEAD_MESSAGES,
} = require("../../controller-messages/lead-messages/lead.messages");
const { Lead_Comments } = require("../../models/lead/lead.comments.model");
const { Summaries } = require("../../models/lead/summaries.model");

/* ADD NEW LEAD SUMMARIES // METHOD: POST */
/* PAYLOAD: lead_comment_id, follow_up, follow_up_comment */
const addSummaries = async (req, res) => {
  try {
    const { lead_comment_id, follow_up, follow_up_comment } = req.body;
    const _id = new mongoose.Types.ObjectId(lead_comment_id);
    const lead_comment = await Lead_Comments.findById({ _id: _id });
    if (lead_comment) {
      const lead_comment_summary = await Summaries.create({
        lead_comment_id,
        follow_up,
        follow_up_comment,
      });
      if (lead_comment_summary) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAD_MESSAGES.LEAD_COMMENT_SUMMARY_CREATED,
          data: lead_comment_summary,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: LEAD_MESSAGES.LEAD_COMMENT_SUMMARY_NOT_CREATED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAD_MESSAGES.LEAD_COMMENTS_NOT_FOUND,
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
  addSummaries,
};
