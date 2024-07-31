const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  ROLE_MESSAGE,
} = require("../../controller-messages/role-messages/role.messages");
const Roles = require("../../models/role/role.model");

/* LIST ALL ROLES // METHOD: POST // PAYLOAD: { filter, search, sort, current_page, per_page } */
const listRoles = async (req, res) => {
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
    const search_by = search ? search : "";
    const sort_column = sort
      ? sort.column
        ? sort.column
        : "created_date"
      : "created_date";
    const sort_column_key = sort_column === "role" ? "role" : "created_date";

    const order_by = sort.order ? sort.order : -1;

    let result = await Roles.aggregate([
      {
        $match: {
          is_deleted: false,
          role: { $regex: `^${search_by}`, $options: "i" },
          created_date: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
      },
      {
        $project: {
          _id: 1,
          role: 1,
          created_date: 1,
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
        message: ROLE_MESSAGE.ROLE_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ROLE_MESSAGE.ROLE_NOT_FOUND,
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

/* LIST ALL ROLES For Dropdown // METHOD: GET */
const listRolesDropDown = async (req, res) => {
  try {
    let result = await Roles.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 1,
          role: 1,
        },
      },
    ]);

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ROLE_MESSAGE.ROLE_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ROLE_MESSAGE.ROLE_NOT_FOUND,
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

/* ADD NEW ROLE // METHOD: POST // PAYLOAD: role */
const addRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Roles.create({
      role: role,
      created_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ROLE_MESSAGE.ROLE_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ROLE_MESSAGE.ROLE_NOT_SAVED,
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

/* DELETE ROLE // METHOD: DELETE // PAYLOAD: role_id */
const deleteRole = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Roles.findByIdAndUpdate(role_id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ROLE_MESSAGE.ROLE_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: ROLE_MESSAGE.ROLE_NOT_DELETED,
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
  listRoles,
  addRole,
  deleteRole,
  listRolesDropDown,
};
