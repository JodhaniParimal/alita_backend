const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
} = require("../../constants/global.constants");
const {
  EMPLOYEE_SKILL_RATING_MESSAGE,
} = require("../../controller-messages/behaviouralSkillset-messages/employee.skill.ratings.messages");
const {
  Employee_Skill_Rating,
} = require("../../models/behaviour/employee.skill.ratings.model");
const {
  Employee_Skills,
} = require("../../models/behaviour/employee.skill.model");
const { EMPLOYEE_SKILL } = require("../../constants/models.enum.constants");

/* ADD EMPLOYEE SKILL RATINGS // METHOD: POST // PAYLOAD: {employee_code, rating} */
const addEmployeeSkillRating = async (req, res) => {
  try {
    const { employee_code, rating } = req.body;
    let employeeSkillWithIdNull = rating.employee_skill_rating
      .filter((o) => o._id === null || !o._id)
      .map((o) => o.title);

    if (employeeSkillWithIdNull.length) {
      const optRegexp = [];
      employeeSkillWithIdNull.forEach(function (opt) {
        optRegexp.push(new RegExp("^" + opt + "$", "i"));
      });

      let existingEmployeeSkill = await Employee_Skills.find({
        title: { $in: optRegexp },
      }).select({ _id: 1, title: 1 });

      let newEmployeeSkill = [];

      employeeSkillWithIdNull.forEach((e) => {
        if (existingEmployeeSkill.length) {
          if (
            existingEmployeeSkill.some(
              (o) => o.title.toLowerCase() != e.toLowerCase()
            )
          ) {
            newEmployeeSkill.push({ title: e });
          }
        } else {
          newEmployeeSkill.push({ title: e });
        }
      });

      if (newEmployeeSkill.length) {
        let addedEmployeeSkill = await Employee_Skills.create(newEmployeeSkill);

        addedEmployeeSkill.forEach((e) => {
          if (rating.employee_skill_rating.some((o) => o.title == e.title)) {
            rating.employee_skill_rating.find((o) => o.title == e.title)._id =
              e._id.toString();
          }
        });
      }
    }

    let existingEmpSkillRatings = await Employee_Skill_Rating.find({
      employee_code: employee_code,
      is_deleted: false,
      is_disable: false,
    }).select({
      _id: 1,
      employee_code: 1,
      rating: 1,
      employee_skill_id: 1,
      skill_type: 1,
    });

    let newEmpSkillRatings = [],
      updateExistingRating = [];
    if (existingEmpSkillRatings.length) {
      existingEmpSkillRatings.forEach((e) => {
        if (
          rating.employee_skill_rating.some((o) => o._id == e.employee_skill_id)
        ) {
          let newRating = rating.employee_skill_rating.find(
            (o) => o._id == e.employee_skill_id
          ).rating;
          updateExistingRating.push({ _id: e._id, rating: newRating });
          let deleteIndex = rating.employee_skill_rating.findIndex(
            (o) => o._id == e.employee_skill_id
          );
          if (deleteIndex != -1) {
            rating.employee_skill_rating.splice(deleteIndex, 1);
          }
        }
      });
    }
    rating.employee_skill_rating.forEach((element) => {
      newEmpSkillRatings.push({
        employee_code: employee_code,
        rating: element.rating,
        employee_skill_id: element._id,
        skill_type: element.skill_type,
      });
    });
    if (newEmpSkillRatings.length) {
      await Employee_Skill_Rating.create(newEmpSkillRatings);
    }
    if (updateExistingRating.length) {
      const writeOperations = updateExistingRating.map((item) => {
        return {
          updateOne: {
            filter: { _id: item._id },
            update: { rating: item.rating },
          },
        };
      });
      await Employee_Skill_Rating.bulkWrite(writeOperations);
    }

    let result = await Employee_Skill_Rating.aggregate([
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
        $project: {
          rating: "$rating",
          employee_code: "$employee_code",
          employee_skill_id: "$employee_skill_id",
          skill_type: "$skill_type",
          skill: { $arrayElemAt: ["$skill.title", 0] },
        },
      },
    ]);
    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_ADDED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_NOT_ADDED,
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

/* UPDATE EMPLOYEE SKILL RATINGS // METHOD: PUT // PAYLOAD: {rating} // PARAMS: _id */
const updateEmployeeSkillRating = async (req, res) => {
  try {
    const { _id } = req.params;
    const { rating } = req.body;

    const employeeSkillRatingUpdate =
      await Employee_Skill_Rating.findByIdAndUpdate(_id, { rating: rating });
    if (employeeSkillRatingUpdate) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_UPDATE,
        data: null,
        error: null,
      };
      res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_NOT_UPDATE,
      };
      res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
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

/* LIST EMPLOYEE SKILL RATING // METHOD: GET // PARAMS: employee_code */
const getOneEmployeeSkillRating = async (req, res) => {
  try {
    const { employee_code } = req.params;
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

/* DELETE EMPLOYEE SKILL RATING // METHOD: DELETE // PARAMS: _id */
const deleteEmployeeSkillRating = async (req, res) => {
  try {
    const { _id } = req.params;
    const deleteProgrammingRating =
      await Employee_Skill_Rating.findByIdAndUpdate(_id, {
        is_deleted: true,
        is_disable: true,
      });
    if (deleteProgrammingRating) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_DELETED,
        data: null,
        error: null,
      };
      res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_SKILL_RATING_MESSAGE.EMPLOYEE_SKILL_RATING_NOT_DELETED,
      };
      res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
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
  addEmployeeSkillRating,
  updateEmployeeSkillRating,
  getOneEmployeeSkillRating,
  deleteEmployeeSkillRating,
};
