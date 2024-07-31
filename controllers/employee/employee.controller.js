const bcrypt = require("bcryptjs");

const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  AUTH_USER_DETAILS,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");

const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.messages");

const Employee = require("../../models/employee/employee.model");
const Role = require("../../models/role/role.model");
const {
  EMPLOYEE_CONTACT_DETAILS,
  EMPLOYEE_FAMILY_DETAILS,
  EMPLOYEE_OFFICE_DETAILS,
  EMPLOYEE_DOCUMENTS,
  ROLE,
  DEPARTMENT,
  PROJECT,
  EMPLOYEE_PROJECT,
} = require("../../constants/models.enum.constants");
const { padWithLeadingZeros, passwordHash } = require("../../helpers/fn");
const Employee_Contact_Details = require("../../models/employee/employee.contact.details.model");
const Employee_Family_Details = require("../../models/employee/employee.family.details.model");
const Employee_Group = require("../../models/group/employee.group.model");
const Group = require("../../models/group/group.model");
const { AUTH_MESSAGES } = require("../../controller-messages/auth.messages");
const {
  listEmployeeGroupsForAll,
} = require("../group/employee.group.controller");
const { ENUMS } = require("../../constants/enum.constants");
const Roles = require("../../models/role/role.model");
const Department = require("../../models/department/department.model");

/* LIST ALL EMPLOYEES // METHOD: GET */
const listAllEmployees = async (req, res) => {
  try {
    const {
      filter,
      search,
      sort,
      current_page,
      per_page,
      with_project_or_not,
    } = req.body;
    const { date } = filter;
    const { teamMembers } = req[AUTH_USER_DETAILS];
    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;
    const date_start = date
      ? date.start
        ? date.start
        : new Date("1947-08-15").getTime()
      : new Date("1947-08-15").getTime();
    const date_end = date ? (date.end ? date.end : new Date()) : new Date();
    const search_by = search ? search.replace(/[^0-9a-zA-Z]/g, "\\$&") : "";
    const sort_column = sort
      ? sort.column
        ? sort.column
        : "employee_code"
      : "employee_code";
    const sort_column_key =
      sort_column === "employee_code"
        ? "employee_code"
        : sort_column === "email"
          ? "email"
          : sort_column === "firstname"
            ? "firstname"
            : sort_column === "lastname"
              ? "lastname"
              : sort_column === "age"
                ? "age"
                : sort_column === "date_of_joining"
                  ? "date_of_joining"
                  : sort_column === "status"
                    ? "status"
                    : sort_column === "phone_number"
                      ? "phone_number"
                      : "employee_code";

    let matchObj = {
      is_deleted: false,
      employee_code: { $in: teamMembers },
      created_date: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
    };
    if (search_by != "") {
      matchObj = {
        ...matchObj,
        $or: [{ firstname: { $regex: `^${search_by}`, $options: "i" } }],
      };
    }

    let matchQuery = {};

    if (with_project_or_not === ENUMS.WITH_PROJECT_OR_NOT.WITHOUT_PROJECT) {
      matchQuery.with_project_or_not = ENUMS.WITH_PROJECT_OR_NOT.WITHOUT_PROJECT;
    } else if (with_project_or_not === ENUMS.WITH_PROJECT_OR_NOT.WITH_PROJECT) {
      matchQuery.with_project_or_not = ENUMS.WITH_PROJECT_OR_NOT.WITH_PROJECT;
    }

    const order_by = sort?.order ? sort.order : -1;
    let result = await Employee.aggregate([
      {
        $match: matchObj,
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
          from: EMPLOYEE_PROJECT,
          localField: "employee_code",
          foreignField: "employee_code",
          as: "employee_projects",
          pipeline: [
            {
              $match: {
                is_deleted: false,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: PROJECT,
          localField: "employee_projects.project_code",
          foreignField: "project_code",
          as: "projects",
        },
      },
      {
        $addFields: {
          alternative_phone_number: {
            $arrayElemAt: [
              "$employee_contact_details.alternative_phone_number",
              0,
            ],
          },
          phone_number: {
            $arrayElemAt: ["$employee_contact_details.phone_number", 0],
          },
          num_projects: { $size: "$projects" },
          project_names: {
            $map: {
              input: "$projects",
              as: "project",
              in: "$$project.project_title",
            },
          },
        },
      },
      {
        $addFields: {
          with_project_or_not: {
            $cond: {
              if: { $gt: ["$num_projects", 0] },
              then: "with_project",
              else: "without_project",
            },
          },
        },
      },
      {
        $match: matchQuery,
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
          employee_contact_details: 0,
          projects: 0,
          employee_projects: 0,
        },
      },
      {
        $sort: { employee_code: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (current_page_f - 1) * per_page_f },
            { $limit: per_page_f },
            { $sort: { [sort_column_key]: order_by } },
          ],
        },
      },
      {
        $addFields: {
          total: { $arrayElemAt: ["$metadata.total", 0] },
          currentPage: current_page_f,
        },
      },
      {
        $project: {
          data: 1,
          metaData: {
            current_page: "$currentPage",
            total_page: { $ceil: { $divide: ["$total", per_page_f] } },
            per_page: `${per_page_f}`,
            total_count: "$total",
          },
        },
      },
    ]);
    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_FOUND,
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

// LIST EMPLOYEE DEPARTMENT
const listEmployeeDepartment = async (req, res) => {
  try {
    let result = await Employee.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: DEPARTMENT,
          let: { department_id: "$department_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$department_id"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
          ],
          as: "department",
        },
      },
      {
        $addFields: {
          department: { $arrayElemAt: ["$department", 0] },
        },
      },
      {
        $project: {
          _id: 0,
          employee_code: "$employee_code",
          fullname: { $concat: ["$firstname", " ", "$lastname"] },
          department_title: {
            $ifNull: ["$department.title", "---"],
          },
        },
      },
    ]);

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_DEPARTMENT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_DEPARTMENT_NOT_FOUND,
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

/* LIST ALL EMPLOYEES ONLY WITH EMPLOYEE_CODE AND NAME for dropdown // METHOD: GET */
const listEmployees = async (req, res) => {
  try {
    const result = await Employee.aggregate([
      {
        $match: { is_deleted: false },
      },
      {
        $project: {
          _id: 1,
          employee_code: 1,
          name: { $concat: ["$firstname", " ", "$lastname"] },
        },
      },
    ]);

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

/* LIST ALL EMPLOYEES ONLY WITH EMPLOYEE_CODE AND NAME for team search dropdown // METHOD: GET */
const listEmployeesForTeam = async (req, res) => {
  try {
    let output;
    const { permissions } = req[AUTH_USER_DETAILS];

    const employeePermission = permissions.filter(
      (o) => o.name == ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT
    );

    if (employeePermission && employeePermission.length > 0) {
      output = await Employee.aggregate([
        {
          $match: { is_deleted: false },
        },
        {
          $project: {
            _id: 1,
            employee_code: 1,
            name: { $concat: ["$firstname", " ", "$lastname"] },
          },
        },
      ]);
    } else {
      const { teamMembers } = req[AUTH_USER_DETAILS];
      output = await Employee.aggregate([
        {
          $match: {
            is_deleted: false,
            employee_code: { $in: teamMembers },
          },
        },
        {
          $project: {
            _id: 1,
            employee_code: 1,
            name: { $concat: ["$firstname", " ", "$lastname"] },
          },
        },
      ]);
    }

    if (output) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FOUND,
        data: output,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_FOUND,
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

/* LIST ALL EMPLOYEES ONLY WITH EMPLOYEE_CODE AND NAME for dropdown // METHOD: GET */
const listTLPM = async (req, res) => {
  try {
    let permissionArr = ["employee-lead-view"];
    let result = await Employee.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "roles",
        },
      },
      {
        $unwind: "$roles",
      },
      {
        $project: {
          _id: 1,
          employee_code: 1,
          name: { $concat: ["$firstname", " ", "$lastname"] },
        },
      },
    ]);

    if (result.length) {
      for (let i = 0; i < result.length; i++) {
        let empPermissions = await listEmployeeGroupsForAll(
          result[i].employee_code
        );
        if (empPermissions.status) {
          let permissions = empPermissions.result.permissions;
          if (!permissions.some((e) => permissionArr.includes(e.name))) {
            let arrIndex = result.findIndex(
              (e) => e.employee_code == result[i].employee_code
            );
            if (arrIndex != -1) {
              result.splice(arrIndex, 1);
            }
          }
        }
      }
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

/* GET ONE EMPLOYEE BY employee_code in PARAMS // METHOD: GET */
const getEmployeeByCode = async (req, res) => {
  try {
    const { employee_code } = req.params;
    let result = await Employee.aggregate([
      {
        $match: { employee_code: employee_code, is_deleted: false },
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
            $arrayElemAt: ["$employee_documents", 0],
          },
          employee_contact_details: {
            $arrayElemAt: ["$employee_contact_details", 0],
          },
          employee_family_details: {
            $arrayElemAt: ["$employee_family_details", 0],
          },
          employee_office_details: {
            $arrayElemAt: ["$employee_office_details", 0],
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

    if (result.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
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

/* ADD OTHER EMPLOYEE, if login user has permission to add // METHOD: POST */
/* PAYLOAD: Required Field -> {email,password,role_id}
            Non-required field -> {firstname,lastname,middlename,age,blood_group,gender} */
const addEmployee = async (req, res) => {
  try {
    let {
      email,
      password,
      role_id,
      firstname,
      lastname,
      middlename,
      blood_group,
      date_of_birth,
      department_id,
      gender,
      date_of_joining,
      contact_details,
      family_details,
    } = req.body;

    email = email.toLowerCase();

    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];

    const getLastCode = await Employee.find()
      .sort({ employee_code: -1 })
      .limit(1);

    const nextNum = getLastCode[0]?.employee_code.replace(
      /(\d+)+/g,
      function (match, number) {
        let newCode = padWithLeadingZeros(parseInt(number) + 1, 6);
        return newCode;
      }
    );

    const hashedPassword = await passwordHash(password);
    // const hashedPassword = await bcrypt.hash(password, 12);
    const employee_code = nextNum;
    let result = await Employee.create({
      employee_code,
      email,
      password: hashedPassword,
      role_id,
      firstname,
      lastname,
      middlename,
      blood_group,
      date_of_birth,
      department_id,
      gender,
      date_of_joining,
      created_by: auth_employee_code,
    });
    if (contact_details) {
      contact_details = { ...contact_details, created_by: auth_employee_code };
      await Employee_Contact_Details.create({
        employee_code,
        ...contact_details,
      });
    }
    if (family_details) {
      family_details = { ...family_details, created_by: auth_employee_code };
      await Employee_Family_Details.create({
        employee_code,
        ...family_details,
      });
    }

    const employee_group = await Employee_Group.findOne({
      employee_code: employee_code,
    });

    if (!employee_group) {
      let grpDetails = await Group.find({
        is_deleted: false,
      }).select({ _id: 1, title: 1 });

      if (grpDetails.length) {
        let grp_id = grpDetails.find((e) => e.title == "trainee")._id;

        await Employee_Group.create({
          employee_code: employee_code,
          group_id: grp_id,
          created_by: employee_code,
        });
      }
    }
    if (result) {
      result = JSON.parse(JSON.stringify(result));
      delete result.password;

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_CREATED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_CREATED,
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
const updateEmployee = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    let { employee_code } = req.params;

    if (!employee_code) {
      employee_code = auth_employee_code;
    }

    let updateObj = { ...req.body, updated_by: auth_employee_code };

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

/* GET ONE EMPLOYEE BY employee_code in PARAMS AND DELETE // METHOD: DELETE */
const deleteEmployee = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;

    const employeeUpdated = await Employee.findOneAndUpdate(
      { employee_code: employee_code, is_deleted: false },
      { is_deleted: true, deleted_by: auth_employee_code },
      { new: true }
    );

    if (employeeUpdated) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_DELETED,
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

/* CHECK EMPLOYEE IS EXISTS OR NOT */
const checkExistingEmployee = async (employee_code) => {
  const existingUser = await Employee.findOne({
    employee_code: employee_code,
    is_deleted: false,
  });
  if (!existingUser) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: EMPLOYEE_MESSAGE.EMPLOYEE_NOT_EXISTS,
    };
    return { status: 0, res: responsePayload };
  } else {
    return { status: 1 };
  }
};

/*UPDATE EMPLOYEE ROLE*/
const updateEmployeeRole = async (req, res) => {
  try {
    // const { employee_code } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;
    const { role_id } = req.body;

    const roleUpdated = await Employee.findOneAndUpdate(
      { employee_code: employee_code, is_deleted: false },
      { role_id: role_id },
      { new: true }
    );

    if (roleUpdated) {
      const designation = await Roles.findById(role_id).select({
        _id: 1,
        role: 1,
      });
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_ROLE_UPDATED,
        data: designation,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.EMPLOYEE_ROLE_NOT_UPDATED,
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

/*UPDATE EMPLOYEE ROLE*/
const updateEmployeeDepartment = async (req, res) => {
  try {
    // const { employee_code } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;
    const { department_id } = req.body;

    const departmentUpdated = await Employee.findOneAndUpdate(
      { employee_code: employee_code, is_deleted: false },
      { department_id: department_id },
      { new: true }
    );

    if (departmentUpdated) {
      const department = await Department.findById(department_id).select({
        _id: 1,
        title: 1,
      });
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_DEPARTMENT_UPDATED,
        data: department,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.EMPLOYEE_DEPARTMENT_NOT_UPDATED,
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

/*UPDATE EMPLOYEE TRACKER TOKEN*/
const employeeTrackerTokenNull = async (req, res) => {
  try {
    const { employee_code: loggedInEmployee } = req[AUTH_USER_DETAILS];
    const { employee_code } = req.params;

    const TokenNull = await Employee.findOneAndUpdate(
      { employee_code: employee_code, is_deleted: false },
      { tracker_token: null, updated_by: loggedInEmployee },
      { new: true }
    );

    if (TokenNull) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.TRACKER_TOKEN_NULL,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.TRACKER_TOKEN_NOT_NULL,
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

/*UPDATE All EMPLOYEE TRACKER TOKEN to null*/
const allEmployeeTrackerTokenNull = async (req, res) => {
  try {
    const { employee_code: loggedInEmployee } = req[AUTH_USER_DETAILS];

    const TokenNull = await Employee.updateMany(
      { tracker_token: { $ne: null }, is_deleted: false },
      { tracker_token: null, updated_by: loggedInEmployee },
      { new: true }
    );

    if (TokenNull) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.TRACKER_TOKEN_NULL,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: EMPLOYEE_MESSAGE.TRACKER_TOKEN_NOT_NULL,
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
  listAllEmployees,
  listEmployees,
  listTLPM,
  getEmployeeByCode,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  checkExistingEmployee,
  listEmployeeDepartment,
  updateEmployeeRole,
  updateEmployeeDepartment,
  allEmployeeTrackerTokenNull,
  employeeTrackerTokenNull,
  listEmployeesForTeam,
};
