const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");
const {
  LEAD_MESSAGES,
} = require("../../controller-messages/lead-messages/lead.messages");
const { Attachment } = require("../../models/lead/attachments.model");

/* ADD NEW LEAD ATTACHMENT // METHOD: POST */
/* PAYLOAD: lead_code, path */
const addAttachments = async (req, res) => {
  try {
    const { lead_code, path } = req.body;
    const attachmentObj = {
      lead_code: lead_code,
      path: path,
    };
    if (req.file) {
      const addAttachment = await Attachment.create(attachmentObj);

      if (addAttachment) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAD_MESSAGES.ATTACHMENTS_ADDED_SUCCESS,
          data: addAttachment,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: LEAD_MESSAGES.ATTACHMENTS_NOT_ADDED_SUCCESS,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: LEAD_MESSAGES.ATTACHMENTS_NOT_IN_REQ_FILE,
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

/* UPDATE LEAD ATTACHMENT // METHOD: PUT in PARAMS id of attachment */
const updateAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { lead_code, path } = req.body;
    const attachmentObj = {
      lead_code: lead_code,
      path: path,
      updated_by: id,
    };

    if (req.file) {
      const updatedAttachment = await Attachment.findByIdAndUpdate(
        id,
        attachmentObj,
        { new: true }
      );
      if (updatedAttachment) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAD_MESSAGES.ATTACHMENT_UPDATED_SUCCESS,
          data: updatedAttachment,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: LEAD_MESSAGES.ATTACHMENT_NOT_UPDATED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAD_MESSAGES.ATTACHMENTS_NOT_IN_REQ_FILE,
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

/* DELETE LEAD ATTACHMENT // METHOD: DELETE in PARAMS id of attachment */
const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAttachment = await Attachment.findByIdAndUpdate(id, {
      is_deleted: true,
      deleted_by: id,
    });
    if (deletedAttachment) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.ATTACHMENT_DELETED_SUCCESS,
        data: deletedAttachment,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAD_MESSAGES.ATTACHMENT_NOT_DELETED,
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

module.exports = { addAttachments, updateAttachment, deleteAttachment };
