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
} = require("../../constants/models.enum.constants");
const {
  GROUP_PERMISSION_MESSAGE,
} = require("../../controller-messages/group-messages/group.permission.messages");
const Group_Permission = require("../../models/group/group.permission.model");
const Group = require("../../models/group/group.model");

/* LIST GROUP PERMISSION based on group ID from PARAMS // METHOD: GET */
const listGroupPermissionById = async (req, res) => {
  try {
    /* USING AGGREGATE */
    const { group_id } = req.params;
    const g_id = new mongoose.Types.ObjectId(group_id);
    // const g_id = new ObjectId(group_id);

    let result = await Group.aggregate([
      {
        $match: {
          is_deleted: false,
          _id: g_id,
        },
      },
      {
        $lookup: {
          from: GROUP_PERMISSION,
          let: { grp: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$group_id", "$$grp"] },
                is_deleted: false,
              },
            },
            {
              $lookup: {
                from: PERMISSION,
                let: { per: "$permission_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$per"] },
                      is_deleted: false,
                    },
                  },
                ],
                as: "permission",
              },
            },
            {
              $project: {
                _id: {
                  $cond: {
                    if: { $gte: [{ $size: "$permission" }, 1] },
                    then: { $arrayElemAt: ["$permission._id", 0] },
                    else: "",
                  },
                },
                name: {
                  $cond: {
                    if: { $gte: [{ $size: "$permission" }, 1] },
                    then: { $arrayElemAt: ["$permission.name", 0] },
                    else: "",
                  },
                },
              },
            },
          ],
          as: "permission",
        },
      },
      {
        $group: {
          _id: "$_id",
          group: {
            $first: {
              _id: "$_id",
              title: "$title",
            },
          },
          permissions: { $first: "$permission" },
        },
      },
    ]);
    if (result.length) {
      result[0].permissions = result[0].permissions.filter(function (obj) {
        return obj._id !== "";
      });
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_NOT_FOUND,
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

/* LIST All Group PERMISSION // METHOD: POST // PAYLOAD: {filter, search, sort, current_page, per_page} */
const listGroupPermission = async (req, res) => {
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
      sort_column === "group_id"
        ? "group_id"
        : sort_column === "title"
          ? "title"
          : "created_date";

    const order_by = sort.order ? sort.order : -1;
    const permissions = await Group.aggregate([
      {
        $match: {
          title: { $regex: `^${search_by}`, $options: "i" },
          created_date: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: GROUP_PERMISSION,
          let: { g_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$g_id", "$group_id"],
                },
                is_deleted: false,
              },
            },
            {
              $lookup: {
                from: PERMISSION,
                let: { p_id: "$permission_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$$p_id", "$_id"] },
                      is_deleted: false,
                    },
                  },
                  { $project: { name: 1 } },
                ],
                as: "permit",
              },
            },
            { $sort: { "permit.name": 1 } },
            {
              $project: {
                _id: 0,
                permit: { $arrayElemAt: ["$permit", 0] },
              },
            },
          ],
          as: "g_p",
        },
      },
      {
        $addFields: {
          permissions: {
            $filter: {
              input: "$g_p",
              as: "gp",
              cond: { $ne: ["$$gp.permit", null] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          created_date: 1,
          permissions: {
            $map: {
              input: "$permissions",
              as: "perm",
              in: {
                _id: "$$perm.permit._id",
                name: "$$perm.permit.name",
              },
            },
          },
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
            { $sort: { [sort_column]: order_by } },
          ],
        },
      },
      {
        $addFields: {
          currentPage: current_page_f,
          total: { $arrayElemAt: ["$metadata.total", 0] },
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

    if (permissions && permissions.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_FOUND,
        data: permissions[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_NOT_FOUND,
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

/* ADD Group PERMISSION // METHOD: POST // PAYLOAD: {group_id, permission_id} */
const addGroupPermission = async (req, res) => {
  try {
    const { group_id, permission_id } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Group_Permission.create({
      group_id: group_id,
      permission_id: permission_id,
      created_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_NOT_SAVED,
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

/* UPDATE Group PERMISSION // METHOD: PUT // PAYLOAD: {group_id, permissions, title} */
const updateGroupPermission = async (req, res) => {
  try {
    const { group_id, permissions, title } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    const groupTitle = await Group.findById(group_id).select({ title: 1 });

    if (groupTitle.title !== title) {
      await Group.findByIdAndUpdate(group_id, { title }).select({ title: 1 });
    }

    let existingPer = await Group_Permission.find({
      group_id: group_id,
      is_deleted: false,
    });

    existingPer = JSON.parse(JSON.stringify(existingPer));

    let newPer = [];
    if (existingPer.length) {
      let newPermissions = permissions.filter(
        (e) => !existingPer.some((el) => el.permission_id == e)
      );
      let deletePermissionsIds = existingPer
        .filter((e) => !permissions.includes(e.permission_id))
        .map((e) => e.permission_id);

      await Group_Permission.updateMany(
        {
          group_id: group_id,
          permission_id: { $in: deletePermissionsIds },
        },
        {
          is_deleted: true,
          deleted_by: employee_code,
        }
      );
      newPermissions.forEach((e) => {
        newPer.push({
          group_id: group_id,
          permission_id: e,
          created_by: employee_code,
        });
      });
    } else {
      if (permissions.length) {
        permissions.forEach((e) => {
          newPer.push({
            group_id: group_id,
            permission_id: e,
            created_by: employee_code,
          });
        });
      }
    }
    if (newPer.length) {
      await Group_Permission.create(newPer);
    }

    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_SAVED,
      data: null,
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
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

/* DELETE Group PERMISSION BASED ON group_id and permission_id FROM body // METHOD: DELETE // PAYLOAD: { group_id, permission_id } */
const deleteGroupPermission = async (req, res) => {
  try {
    const { group_id, permission_id } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let grpPermission = await Group_Permission.findByIdAndUpdate(
      {
        group_id: group_id,
        permission_id: permission_id,
        is_deleted: false,
      },
      { is_deleted: true, deleted_by: employee_code },
      { new: true }
    );

    if (grpPermission) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: GROUP_PERMISSION_MESSAGE.GROUP_PERMISSION_NOT_DELETED,
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
  listGroupPermissionById,
  updateGroupPermission,
  deleteGroupPermission,
  listGroupPermission,
  addGroupPermission,
};
