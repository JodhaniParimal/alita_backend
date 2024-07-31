const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");
const {
  EMPLOYEE_PROJECT_MESSAGES,
} = require("../../controller-messages/project-messages/employee.project.messages");
const {
  PROJECT,
  EMPLOYEE,
  CLIENT,
} = require("../../constants/models.enum.constants");
const Employee = require("../../models/employee/employee.model");
const {
  Employee_Project,
} = require("../../models/project/employee.project.model");

/* ADD NEW EMPLOYEE PROJECT // METHOD: POST */
/* PAYLOAD: employee_code, project_code */
const addEmployeeProject = async (req, res) => {
  try {
    const { employee_code, project_code } = req.body;

    const existingData = [];
    const nonExistingData = [];
    const allProjectEmployee = await Employee_Project.aggregate([
      {
        $match: {
          is_deleted: false,
          project_code,
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$employee_code" },
          pipeline: [
            {
              $project: {
                _id: 0,
                employee_code: 1,
              },
            },
          ],
          as: "employee",
        },
      },
    ]);
    const allProjectEmployeeCodes = allProjectEmployee.map(
      (o) => o.employee_code
    );

    const notExistingData = allProjectEmployeeCodes.filter(
      (code) => !employee_code.includes(code)
    );

    await Employee_Project.updateMany(
      {
        employee_code: { $in: notExistingData },
        project_code: project_code,
      },
      {
        $set: {
          is_disable: true,
          is_deleted: true,
        },
      }
    );

    for (const code of employee_code) {
      const exists = await Employee_Project.findOne({
        is_disable: false,
        employee_code: code,
        project_code: project_code,
      });

      if (exists) {
        existingData.push({ employee_code: code, project_code: project_code });
      } else {
        nonExistingData.push({
          employee_code: code,
          project_code: project_code,
        });
      }
    }
    if (nonExistingData.length && nonExistingData.length > 0) {
      const result = await Employee_Project.insertMany(nonExistingData);
      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: EMPLOYEE_PROJECT_MESSAGES.EMPLOYEE_PROJECT_CREATED,
          data: result,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: EMPLOYEE_PROJECT_MESSAGES.EMPLOYEE_PROJECT_NOT_CREATED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_PROJECT_MESSAGES.EMPLOYEE_PROJECT_ALREADY_EXISTS,
        data: null,
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

/* LIST ALL EMPLOYEE PROJECT CODE // METHOD: GET // PARAMS: employee_code */
const listEmployeeProjectCode = async (req, res) => {
  try {
    const { employee_code } = req.params;
    const listProjects = await Employee_Project.aggregate([
      { $match: { employee_code: employee_code, is_deleted: false } },
      {
        $lookup: {
          from: PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_code", "$$p_code"] },
                is_deleted: false,
              },
            },
            {
              $lookup: {
                from: CLIENT,
                let: { c_id: "$client_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$c_id"] },
                      is_deleted: false,
                    },
                  },
                ],
                as: "clients",
              },
            },
            { $unwind: "$clients" },
            {
              $addFields: {
                client_name: "$clients.client_name",
              },
            },
            {
              $project: {
                _id: 0,
                project_code: 1,
                project_title: 1,
                client_name: 1,
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $project: {
          _id: 0,
          project_code: { $arrayElemAt: ["$projects.project_code", 0] },
          project_title: { $arrayElemAt: ["$projects.project_title", 0] },
          client_name: { $arrayElemAt: ["$projects.client_name", 0] },
        },
      },
    ]);
    if (listProjects.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_PROJECT_MESSAGES.EMPLOYEE_PROJECT_FOUND,
        data: listProjects,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_PROJECT_MESSAGES.EMPLOYEE_PROJECT_NOT_FOUND,
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

module.exports = {
  addEmployeeProject,
  listEmployeeProjectCode,
};
