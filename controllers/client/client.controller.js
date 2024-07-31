const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  CLIENT_MESSAGES,
} = require("../../controller-messages/client-messages/client-messages");
const Client = require("../../models/client/client.model");
const { ObjectId } = require("mongodb");

/* ADD NEW Client information // METHOD: POST  */
const addClientInformation = async (req, res) => {
  try {
    let {
      client_name,
      email,
      skype_id,
      phone_number,
      linkedin_url,
      company_name,
      company_url,
      country,
      city,
    } = req.body;

    const { _id } = req[AUTH_USER_DETAILS];

    email = email.toLowerCase();

    let result = await Client.create({
      client_name,
      email,
      skype_id,
      phone_number,
      linkedin_url,
      company_name,
      company_url,
      country,
      city,
      created_by: _id,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_ADDED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: CLIENT_MESSAGES.CLIENT_NOT_ADDED,
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

/* UPDATE Client information // METHOD: PUT // PARAMS: id */
const updateClientInformation = async (req, res) => {
  try {
    const { _id } = req.params;
    let {
      client_name,
      email,
      skype_id,
      phone_number,
      linkedin_url,
      company_name,
      company_url,
      country,
      city,
    } = req.body;

    email = email.toLowerCase();


    const result = await Client.findOneAndUpdate({ _id }, {
      client_name,
      email,
      skype_id,
      phone_number,
      linkedin_url,
      company_name,
      company_url,
      country,
      city,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_UPDATE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: CLIENT_MESSAGES.CLIENT_NOT_UPDATE,
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

// LIST Client information BY ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await Client.findById(id);

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_NOT_FOUND,
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

/* LIST ALL Client // METHOD: POST // PAYLOAD: filter, search, sort, current_page, per_page */
const listClient = async (req, res) => {
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
        : "createdAt"
      : "createdAt";
    const sort_column_key =
      sort_column === "client_name"
        ? "client_name"
        : sort_column === "email"
          ? "email"
          : sort_column === "skype_id"
            ? "skype_id"
            : sort_column === "phone_number"
              ? "phone_number"
              : sort_column === "linkedin_url"
                ? "linkedin_url"
                : sort_column === "company_name"
                  ? "company_name"
                  : sort_column === "company_url"
                    ? "company_url"
                    : "createdAt";

    const order_by = sort?.order ? sort.order : -1;

    let matchObj = {
      is_deleted: false,
      createdAt: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
    };

    if (search_by !== "") {
      matchObj = {
        ...matchObj,
        $or: [
          { client_name: { $regex: `^${search_by}`, $options: "i" } },
          { company_name: { $regex: `^${search_by}`, $options: "i" } },
          { email: { $regex: `^${search_by}`, $options: "i" } },
        ],
      };
    }

    const listClient = await Client.aggregate([
      {
        $match: matchObj,
      },
      {
        $sort: { createdAt: -1 },
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
          current_page: current_page_f,
          per_page: per_page_f,
        },
      },
      {
        $project: {
          data: 1,
          metaData: {
            per_page: "$per_page",
            total_page: { $ceil: { $divide: ["$total", per_page_f] } },
            current_page: "$current_page",
            total_count: "$total",
          },
        },
      },
    ]);

    if (listClient) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_FOUND,
        data: listClient[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_NOT_FOUND,
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

/* LIST ALL Client name for dropdown // METHOD: GET  */
const listClientForDropdown = async (req, res) => {
  try {
    const result = await Client.find({ is_deleted: false }).select({
      _id: 1,
      client_name: 1,
    });
    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_NOT_FOUND,
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

/* DELETE Client // METHOD: PUT // PARAMS: id */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Client.findByIdAndUpdate(id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CLIENT_MESSAGES.CLIENT_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: CLIENT_MESSAGES.CLIENT_NOT_DELETED,
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
  addClientInformation,
  updateClientInformation,
  getClientById,
  listClient,
  deleteClient,
  listClientForDropdown,
};
