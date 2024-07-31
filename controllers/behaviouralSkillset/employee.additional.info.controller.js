const {
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
} = require("../../constants/global.constants");
const {
  ADDITIONAL_INFO,
  ADDITIONAL_INFO_TYPES,
} = require("../../constants/models.enum.constants");
const {
  EMPLOYEE_INFO_MESSAGE,
} = require("../../controller-messages/behaviouralSkillset-messages/additinol.info.messages");
const Additional_Info = require("../../models/behaviour/additional.info.model");
const Additional_Info_Types = require("../../models/behaviour/additional.info.types.model");

/* ADD-UPDATE Additional Info // METHOD: POST // PAYLOAD: {employee_code, employeeInfo} */
const addupdateAdditionalinfo = async (req, res) => {
  try {
    const { employee_code, employeeInfo } = req.body;
    let existingAdditionalInfo = await Additional_Info.find({
      employee_code: employee_code,
    }).select({
      _id: 1,
      employee_code: 1,
      title: 1,
      additional_info_type_id: 1,
    });
    let newAdditionalInfo = [],
      updateExistingAdditionalInfo = [];
    if (existingAdditionalInfo.length) {
      existingAdditionalInfo.forEach((e) => {
        if (
          employeeInfo.some(
            (o) => o.additional_info_type_id == e.additional_info_type_id
          )
        ) {
          let newAnswer = employeeInfo.find(
            (o) => o.additional_info_type_id == e.additional_info_type_id
          ).answer;
          updateExistingAdditionalInfo.push({ _id: e._id, answer: newAnswer });
          let deleteIndex = employeeInfo.findIndex(
            (o) => o.additional_info_type_id == e.additional_info_type_id
          );
          if (deleteIndex != -1) {
            employeeInfo.splice(deleteIndex, 1);
          }
        }
      });
    }
    employeeInfo.forEach((element) => {
      newAdditionalInfo.push({
        employee_code: employee_code,
        answer: element.answer,
        additional_info_type_id: element.additional_info_type_id,
      });
    });
    if (newAdditionalInfo.length) {
      await Additional_Info.create(newAdditionalInfo);
    }
    if (updateExistingAdditionalInfo.length) {
      const writeOperations = updateExistingAdditionalInfo.map((item) => {
        return {
          updateOne: {
            filter: { _id: item._id },
            update: { answer: item.answer },
          },
        };
      });
      await Additional_Info.bulkWrite(writeOperations);
    }
    let result = await Additional_Info_Types.aggregate([
      {
        $lookup: {
          from: ADDITIONAL_INFO,
          let: { type_id: "$_id", emp_code: employee_code },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$additional_info_type_id", "$$type_id"] },
                    { $eq: ["$employee_code", "$$emp_code"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                answer: 1,
              },
            },
          ],
          as: "employee_info_answer",
        },
      },
      {
        $addFields: {
          employee_info_answer: {
            $cond: {
              if: { $gte: [{ $size: "$employee_info_answer.answer" }, 1] },
              then: { $arrayElemAt: ["$employee_info_answer.answer", 0] },
              else: "---",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          employee_info_answer: 1,
        },
      },
    ]);
    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_INFO_MESSAGE.EMPLOYEE_INFO_ADDED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_INFO_MESSAGE.EMPLOYEE_INFO_NOT_ADDED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: error.message,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* LIST Employee Additional Info BY employee_code in PARAMS // METHOD: GET */
const listEmployeeAdditionalInfo = async (req, res) => {
  try {
    const { employee_code } = req.params;
    const information = await Additional_Info_Types.aggregate([
      {
        $lookup: {
          from: ADDITIONAL_INFO,
          let: { id: "$_id", emp_code: employee_code },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$additional_info_type_id", "$$id"] },
                    { $eq: ["$employee_code", "$$emp_code"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                answer: 1,
              },
            },
          ],
          as: "employee_info_answer",
        },
      },
      {
        $addFields: {
          employee_info_answer: {
            $cond: {
              if: { $gte: [{ $size: "$employee_info_answer.answer" }, 1] },
              then: { $arrayElemAt: ["$employee_info_answer.answer", 0] },
              else: "---",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          employee_info_answer: 1,
        },
      },
    ]);
    if (information && information.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_INFO_MESSAGE.EMPLOYEE_INFO_FOUND,
        data: information,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_INFO_MESSAGE.EMPLOYEE_INFO_NOT_FOUND,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: error.message,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

module.exports = {
  addupdateAdditionalinfo,
  listEmployeeAdditionalInfo,
};
