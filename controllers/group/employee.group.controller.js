const { default: mongoose } = require("mongoose");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  GROUP,
  PERMISSION,
  GROUP_PERMISSION,
  EMPLOYEE,
  EMPLOYEE_GROUP,
} = require("../../constants/models.enum.constants");
const {
  EMP_GROUP_MESSAGE,
} = require("../../controller-messages/group-messages/employee.group.messages");
const Employee_Group = require("../../models/group/employee.group.model");
const Employee = require("../../models/employee/employee.model");

/* LIST EMPLOYEE GROUPS and PERMISSIONS */
const listEmployeeGroupsForAll = async (employee_code) => {
  try {
    let result = await Employee_Group.aggregate([
      {
        $match: { employee_code: employee_code },
      },
      {
        $lookup: {
          from: GROUP,
          let: { id: "$group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
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
          as: "groups",
        },
      },
      {
        $unwind: {
          path: "$groups",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: GROUP_PERMISSION,
          let: { id: "$group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$group_id", "$$id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                permission_id: 1,
              },
            },
          ],
          as: "groups_permissions",
        },
      },
      {
        $unwind: {
          path: "$groups_permissions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION,
          let: { id: "$groups_permissions.permission_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          as: "permissions",
        },
      },
      {
        $unwind: {
          path: "$permissions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          employee_code: { $first: "$employee_code" },
          groups: { $first: "$groups" },
          permissions: { $push: "$permissions" },
        },
      },
      {
        $project: {
          _id: 1,
          employee_code: 1,
          groups: 1,
          permissions: 1,
        },
      },
    ]);
    if (result.length) {
      return { status: 1, result: result[0] };
    } else {
      return { status: 0, result: {} };
    }
  } catch (error) {
    return error;
  }
};

/* LIST ALL EMPLOYEE GROUPS and PERMISSIONS */
const listAllEmployeePermissions = async () => {
  try {
    let result = await Employee.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_GROUP,
          localField: "employee_code",
          foreignField: "employee_code",
          as: "employee_groups",
        },
      },
      { $addFields: { employeeGroups: "$employee_groups" } },
      {
        $unwind: {
          path: "$employee_groups",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: GROUP,
          let: { id: "$employee_groups.group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
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
          as: "groups",
        },
      },
      { $addFields: { groupsInfo: "$groups" } },
      {
        $unwind: {
          path: "$groups",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: GROUP_PERMISSION,
          let: { id: "$employee_groups.group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$group_id", "$$id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                permission_id: 1,
              },
            },
          ],
          as: "groups_permissions",
        },
      },
      {
        $unwind: {
          path: "$groups_permissions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: PERMISSION,
          let: { id: "$groups_permissions.permission_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          as: "permissions",
        },
      },
      {
        $unwind: {
          path: "$permissions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$employee_code",
          employee_code: { $first: "$employee_code" },
          groups: { $push: "$groups" },
          permissions: { $push: "$permissions.name" },
        },
      },
      {
        $sort: {
          employee_code: 1,
        },
      },
      {
        $project: {
          _id: 0,
          employee_code: 1,
          permissions: 1,
        },
      },
    ]);


    if (result.length) {
      return { status: 1, result: result };
    } else {
      return { status: 0, result: [] };
    }
  } catch (error) {
    return error;
  }
};

/* LIST EMPLOYEE GROUPS and PERMISSIONS // METHOD: POST // PAYLOAD: {filter, search, sort, current_page, per_page} */
const listAllEmployeeGroups = async (req, res) => {
  try {
    const { filter, search, sort, current_page, per_page } = req.body;
    const { date } = filter;

    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;
    const date_start = date
      ? date.start
        ? date.start
        : new Date("1947-08-15").getTime()
      : new Date("1947-08-15").getTime();
    const date_end = date ? (date.end ? date.end : new Date()) : new Date();
    const search_by = search ? search.replace(/[^0-9a-zA-Z]/g, '\\$&') : "";
    const sort_column = sort
      ? sort.column
        ? sort.column
        : "created_date"
      : "created_date";
    const sort_column_key =
      sort_column === "group.title"
        ? "group.title"
        : sort_column === "employee.name"
          ? "employee.name"
          : "created_date";

    const order_by = sort.order ? sort.order : -1;

    let result = await Employee_Group.aggregate([
      {
        $lookup: {
          from: EMPLOYEE,
          let: { code: "$employee_code" },
          pipeline: [
            {
              $match: {
                firstname: { $regex: `${search_by}`, $options: "i" },
                created_date: {
                  $gte: new Date(date_start),
                  $lte: new Date(date_end),
                },
                $expr: {
                  $eq: ["$employee_code", "$$code"],
                },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                name: { $concat: ["$firstname", " - ", "$lastname"] },
              },
            },
          ],
          as: "employee",
        },
      },
      {
        $match: {
          "employee.name": { $regex: `^${search_by}`, $options: "i" },
        },
      },
      {
        $lookup: {
          from: GROUP,
          let: { id: "$group_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
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
          as: "group",
        },
      },
      {
        $project: {
          group: { $arrayElemAt: ["$group", 0] },
          employee_code: 1,
          created_date: 1,
          employee: { $arrayElemAt: ["$employee", 0] },
          group_id: 1,
          _id: 1,
        },
      },
      {
        $sort: { created_date: -1 },
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
        message: EMP_GROUP_MESSAGE.EMP_GROUP_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(200).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMP_GROUP_MESSAGE.EMP_GROUP_NOT_FOUND,
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

/* LIST EMPLOYEE GROUPS and PERMISSIONS by employee_code // METHOD: GET */
const listEmployeeGroups = async (req, res) => {
  const { employee_code } = req.params;
  let data = await listEmployeeGroupsForAll(employee_code);

  if (data.status) {
    if (data.result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMP_GROUP_MESSAGE.EMP_GROUP_FOUND,
        data: data.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMP_GROUP_MESSAGE.EMP_GROUP_NOT_FOUND,
        data: [],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } else {
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

/* ADD/Update EMPLOYEE GROUP // METHOD: POST // PAYLOAD: group_id, employee_code */
const saveEmployeeGroup = async (req, res) => {
  try {
    const { group_id, employee_code } = req.body;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];

    let existingEmp = await Employee_Group.findOne({
      employee_code: employee_code,
    });

    let result;
    if (existingEmp) {
      result = await Employee_Group.findOneAndUpdate(
        { employee_code: employee_code },
        { group_id: group_id, updated_by: auth_employee_code },
        { new: true }
      );
    } else {
      result = await Employee_Group.create({
        employee_code: employee_code,
        group_id: group_id,
        created_by: auth_employee_code,
      });
    }

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMP_GROUP_MESSAGE.EMP_GROUP_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: EMP_GROUP_MESSAGE.EMP_GROUP_NOT_SAVED,
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
  saveEmployeeGroup,
  listEmployeeGroups,
  listEmployeeGroupsForAll,
  listAllEmployeeGroups,
  listAllEmployeePermissions
};
