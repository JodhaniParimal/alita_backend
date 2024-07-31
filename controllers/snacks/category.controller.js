const { default: mongoose } = require("mongoose");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  CATEGORY_MESSAGE,
} = require("../../controller-messages/snacks-messages/category.messages");
const { Snacks_Category } = require("../../models/snacks/category.model");

/* ADD NEW Category // METHOD: POST */
/* PAYLOAD: { name, is_available } */
const addSnacksCategory = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { name, is_available, price_per_category } = req.body;

    const category = await Snacks_Category.create({
      name: name,
      is_available: is_available,
      price_per_category: price_per_category,
      created_by: employee_code,
    });
    if (category) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_ADDED,
        data: category,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: CATEGORY_MESSAGE.CATEGORY_NOT_ADDED,
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

/* UPDATE Category // METHOD: PUT // PARAMS: category id */
/* PAYLOAD: { name } */
const updateSnacksCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];
    var updatedObj = req.body;
    updatedObj = { ...updatedObj, updated_by: employee_code };
    const category = await Snacks_Category.findByIdAndUpdate(id, updatedObj);
    if (category) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_UPDATE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: CATEGORY_MESSAGE.CATEGORY_NOT_UPDATE,
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

/* LIST Category // METHOD: GET */
const listCategory = async (req, res) => {
  try {
    const { search, sort, current_page, per_page, condition } = req.body;

    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;

    const search_by = search ? search : "";

    const sort_column = sort
      ? sort.column
        ? sort.column
        : "createdAt"
      : "createdAt";
    const order_by = sort ? (sort.order ? sort.order : -1) : -1;

    var matchCond = {
      $or: [{ name: { $regex: ".*" + search_by + ".*", $options: "i" } }],
      is_deleted: false,
    };

    if (condition) {
      matchCond = { ...matchCond, ...condition };
    }

    let result = await Snacks_Category.aggregate([
      {
        $match: matchCond,
      },
      {
        $project: {
          name: 1,
          is_available: 1,
          price_per_category: 1,
          created_by: 1,
          createdAt: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { [sort_column]: order_by } },
            { $skip: (current_page_f - 1) * per_page_f },
            { $limit: per_page_f },
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

    if (result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_NOT_FOUND,
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

/* LIST Category for dropdown // METHOD: GET */
const listCategoryForDropdown = async (req, res) => {
  try {
    let result = await Snacks_Category.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $project: {
          name: 1,
        },
      },
    ]);

    if (result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_NOT_FOUND,
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

/* GET Category // METHOD: GET */
const getCategory = async (req, res) => {
  try {
    const { _id } = req.params;
    let result = await Snacks_Category.findOne({
      is_deleted: false,
      _id: new mongoose.Types.ObjectId(_id),
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_NOT_FOUND,
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

/* DELETE Category // METHOD: DELETE // PARAMS: _id */
const deleteCategory = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    var updatedObj = req.body;
    updatedObj = { ...updatedObj, is_deleted: true, deleted_by: employee_code };
    const category = await Snacks_Category.findByIdAndUpdate(_id, updatedObj);
    if (category) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: CATEGORY_MESSAGE.CATEGORY_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: CATEGORY_MESSAGE.CATEGORY_NOT_DELETED,
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
  addSnacksCategory,
  updateSnacksCategory,
  listCategory,
  deleteCategory,
  getCategory,
  listCategoryForDropdown,
};
