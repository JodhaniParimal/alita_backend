const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");
const {
  EMPLOYEE_SKILL_MESSAGE,
} = require("../../controller-messages/behaviouralSkillset-messages/employee.skill.messages");
const {
  Employee_Skills,
} = require("../../models/behaviour/employee.skill.model");

/* LIST EMPLOYEE SKILL // METHOD: GET */
const employeeSkillListingForDropdown = async (req, res) => {
  try {
    const employeeSkill = await Employee_Skills.find({});

    if (employeeSkill && employeeSkill.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_SKILL_MESSAGE.EMPLOYEE_SKILL_FOUND,
        data: employeeSkill,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_SKILL_MESSAGE.EMPLOYEE_SKILL_NOT_FOUND,
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
  employeeSkillListingForDropdown,
};
