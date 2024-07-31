const bcrypt = require("bcryptjs");
const {
  AUTH_USER_DETAILS,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../../../constants/global.constants");
const {
  EMPLOYEE_DOCUMENTS,
  ADDITIONAL_INFO,
  EMPLOYEE_SKILL,
  EMPLOYEE_CONTACT_DETAILS,
  EMPLOYEE_FAMILY_DETAILS,
  EMPLOYEE_OFFICE_DETAILS,
  ROLE,
  DEPARTMENT,
} = require("../../../constants/models.enum.constants");
const { AUTH_MESSAGES } = require("../../../controller-messages/auth.messages");
const {
  EMPLOYEE_INFO_MESSAGE,
} = require("../../../controller-messages/behaviouralSkillset-messages/additinol.info.messages");
const {
  EMPLOYEE_SKILL_RATING_MESSAGE,
} = require("../../../controller-messages/behaviouralSkillset-messages/employee.skill.ratings.messages");
const {
  EMPLOYEE_MESSAGE,
} = require("../../../controller-messages/employee-messages/employee.messages");
const { comparePasswordHash, passwordHash } = require("../../../helpers/fn");
const Additional_Info_Types = require("../../../models/behaviour/additional.info.types.model");
const {
  Employee_Skill_Rating,
} = require("../../../models/behaviour/employee.skill.ratings.model");
const Employee_Contact_Details = require("../../../models/employee/employee.contact.details.model");
const Employee_Documents = require("../../../models/employee/employee.documents.model");
const Employee_Family_Details = require("../../../models/employee/employee.family.details.model");
const Employee = require("../../../models/employee/employee.model");
const Employee_Office_Details = require("../../../models/employee/employee.office.details.model");

/* LIST Employee Skill Rating BY LOGGEDIN EMPLOYEE// METHOD: GET */
const loggedInUserSkillRating = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    let allEmployeeRating = await Employee_Skill_Rating.aggregate([
      {
        $match: { employee_code, is_deleted: false, is_disable: false },
      },
      {
        $lookup: {
          from: EMPLOYEE_SKILL,
          let: { employee_skill_id: "$employee_skill_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$employee_skill_id"] },
              },
            },
          ],
          as: "skill",
        },
      },
      {
        $unwind: "$skill",
      },
      {
        $project: {
          rating: "$rating",
          employee_code: "$employee_code",
          employee_skill_id: "$employee_skill_id",
          skill_type: "$skill_type",
          skill: "$skill.title",
        },
      },
    ]);

    if (allEmployeeRating && allEmployeeRating.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_FOUND,
        data: allEmployeeRating,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_NOT_FOUND,
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

/* LIST Employee Additional Info BY LOGGEDIN EMPLOYEE// METHOD: GET */
const loggedInUserAdditionalInfo = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
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
        data: [],
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

/* LIST Employee Office Details BY LOGGEDIN EMPLOYEE// METHOD: GET */
const loggedInUserOfficeDetails = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    let result = await Employee_Office_Details.findOne({
      employee_code,
    }).select({
      employee_code: 1,
      shift_time: 1,
      position: 1,
      department: 1,
      year_of_experience: 1,
      past_company_details: 1,
      created_date: 1,
    });

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

/* LIST Employee Document BY LOGGEDIN EMPLOYEE// METHOD: GET */
const loggedInUserDocument = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const result = await Employee_Documents.findOne({
      employee_code,
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

/* LIST Employee Contact Details BY LOGGEDIN EMPLOYEE// METHOD: GET */
const loggedInUserContactDetails = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    let result = await Employee_Contact_Details.findOne({
      employee_code,
    }).select({
      employee_code: 1,
      emergency_numbers: 1,
      address: 1,
      phone_number: 1,
      alternative_phone_number: 1,
      created_date: 1,
    });

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

/* LIST Employee Family Details BY LOGGEDIN EMPLOYEE// METHOD: GET */
const loggedInUserFamilyDetails = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    let result = await Employee_Family_Details.findOne({
      employee_code,
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

/**
 * LOGGED IN USER | METHOD: Get
 * @param {params} req
 * @param {loggedInUser} res
 * @returns
 */
const loggedInUserDetails = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const user = await Employee.aggregate([
      {
        $match: { employee_code },
      },
      {
        $lookup: {
          from: ROLE,
          let: { role: "$role_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$role"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                role: 1,
              },
            },
          ],
          as: "role",
        },
      },
      {
        $unwind: "$role",
      },
      {
        $lookup: {
          from: EMPLOYEE_CONTACT_DETAILS,
          let: { emp: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$emp"] },
                is_deleted: false,
                is_disable: false,
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 0,
                is_deleted: 0,
                is_disable: 0,
                created_date: 0,
                updated_date: 0,
                updated_by: 0,
                deleted_by: 0,
              },
            },
          ],
          as: "employee_contact_details",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_FAMILY_DETAILS,
          let: { emp: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$emp"] },
                is_deleted: false,
                is_disable: false,
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 0,
                is_deleted: 0,
                is_disable: 0,
                created_date: 0,
                updated_date: 0,
                updated_by: 0,
                deleted_by: 0,
              },
            },
          ],
          as: "employee_family_details",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_OFFICE_DETAILS,
          let: { emp: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$emp"] },
                is_deleted: false,
                is_disable: false,
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 0,
                is_deleted: 0,
                is_disable: 0,
                created_date: 0,
                updated_date: 0,
                updated_by: 0,
                deleted_by: 0,
              },
            },
          ],
          as: "employee_office_details",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_DOCUMENTS,
          let: { emp: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$emp"] },
                is_deleted: false,
                is_disable: false,
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 0,
                is_deleted: 0,
                is_disable: 0,
                created_date: 0,
                updated_date: 0,
                updated_by: 0,
                deleted_by: 0,
              },
            },
          ],
          as: "employee_documents",
        },
      },
      {
        $lookup: {
          from: DEPARTMENT,
          let: { department_id: "$department_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$department_id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "department",
        },
      },
      {
        $addFields: {
          employee_documents: {
            $cond: {
              if: { $gte: [{ $size: "$employee_documents" }, 1] },
              then: { $arrayElemAt: ["$employee_documents", 0] },
              else: {},
            },
          },
          employee_contact_details: {
            $cond: {
              if: { $gte: [{ $size: "$employee_contact_details" }, 1] },
              then: { $arrayElemAt: ["$employee_contact_details", 0] },
              else: {},
            },
          },
          employee_family_details: {
            $cond: {
              if: { $gte: [{ $size: "$employee_family_details" }, 1] },
              then: { $arrayElemAt: ["$employee_family_details", 0] },
              else: {},
            },
          },
          employee_office_details: {
            $cond: {
              if: { $gte: [{ $size: "$employee_office_details" }, 1] },
              then: { $arrayElemAt: ["$employee_office_details", 0] },
              else: {},
            },
          },
          department: {
            $cond: {
              if: { $gte: [{ $size: "$department" }, 1] },
              then: { $arrayElemAt: ["$department", 0] },
              else: {},
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          reset_token: 0,
          expire_token: 0,
          updated_date: 0,
          updated_by: 0,
          is_deleted: 0,
          last_login: 0,
          token: 0,
        },
      },
    ]);
    if (user && user.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: "User details found",
        data: user[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: "Details not Found",
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

/* UPDATE EMPLOYEE BASIC DETAILS // METHOD: PUT with formdata */
/* PAYLOAD: {firstname,lastname,middlename,age,blood_group,gender, profile_pic} */
const loggedInUserDetailsUpdate = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];

    let updateObj = { ...req.body, updated_by: employee_code };

    if (req.file) {
      const accessPath = "/images/profilePic" + "/" + req.file.filename;
      updateObj = { ...updateObj, profile_pic: accessPath };
    }

    if (req.body.delete_profile) {
      updateObj = { ...updateObj, profile_pic: "" };
    }

    const employeeUpdated = await Employee.findOneAndUpdate(
      { employee_code: employee_code, is_deleted: false },
      updateObj,
      { new: true }
    );

    if (employeeUpdated) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_UPDATED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_UPDATED,
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

/* LOGIN USER PASSWORD CHANGE // METHOD: POST*/
const logInUserPasswordChange = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { current_password, new_password } = req.body;

    let existingUser = await Employee.findOne({
      employee_code: employee_code,
    });

    const isPasswordCorrect = await comparePasswordHash(
      current_password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.CURRENT_PASSWORD_INVALID,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const hashedPassword = await passwordHash(new_password);
      // const hashedPassword = await bcrypt.hash(new_password, 12);
      let result = await Employee.findOneAndUpdate(
        { employee_code: employee_code },
        { password: hashedPassword }
      );
      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESSFULLY,
          data: null,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: AUTH_MESSAGES.PASSWORD_CHANGE_UN_SUCCESSFULLY,
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

module.exports = {
  loggedInUserSkillRating,
  loggedInUserAdditionalInfo,
  loggedInUserOfficeDetails,
  loggedInUserDocument,
  loggedInUserContactDetails,
  loggedInUserDetails,
  loggedInUserFamilyDetails,
  loggedInUserDetailsUpdate,
  logInUserPasswordChange,
};
