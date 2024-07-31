const { default: mongoose } = require("mongoose");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const { SNACKS_CATEGORY } = require("../../constants/models.enum.constants");
const {
  ITEMS_MESSAGE,
} = require("../../controller-messages/snacks-messages/items.messages");
const { Snacks_Items } = require("../../models/snacks/items.model");

/* ADD NEW Items // METHOD: POST */
/* PAYLOAD: { name, is_available } */
const addSnacksItems = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { name, category_id, is_available, price } = req.body;

    const ExistItem = await Snacks_Items.findOne({
      name: { $regex: name, $options: "i" },
      is_deleted: false,
    });
    if (ExistItem) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_EXIST,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      var image;
      if (req.file) {
        const accessPath = "/images/snacks-items" + "/" + req.file.filename;
        image = accessPath;
      }

      const items = await Snacks_Items.create({
        name: name,
        category_id: category_id,
        is_available: is_available,
        image: image,
        price: price,
        created_by: employee_code,
      });
      if (items) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: ITEMS_MESSAGE.ITEMS_ADDED,
          data: items,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: ITEMS_MESSAGE.ITEMS_NOT_ADDED,
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

/* UPDATE Items // METHOD: PUT // PARAMS: item id */
/* PAYLOAD: { name } */
const updateSnacksItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let updatedObj = { ...req.body, updated_by: employee_code };

    if (req.file) {
      const accessPath = "/images/snacks-items" + "/" + req.file.filename;
      updatedObj = { ...updatedObj, image: accessPath };
    }

    if (req.body.delete_image) {
      updatedObj = { ...updatedObj, image: "" };
    }

    const category = await Snacks_Items.findByIdAndUpdate(id, updatedObj);
    if (category) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_UPDATE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ITEMS_MESSAGE.ITEMS_NOT_UPDATE,
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

/* LIST Items // METHOD: GET */
const listItems = async (req, res) => {
  try {
    const { id } = req.params;
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
      category_id: new mongoose.Types.ObjectId(id),
      is_deleted: false,
    };

    if (condition) {
      matchCond = { ...matchCond, ...condition };
    }

    let result = await Snacks_Items.aggregate([
      {
        $match: matchCond,
      },
      {
        $lookup: {
          from: SNACKS_CATEGORY,
          let: { c_id: "$category_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$c_id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $set: { category: "$category.name" },
      },
      {
        $project: {
          name: 1,
          category_id: 1,
          is_available: 1,
          image: 1,
          price: 1,
          created_by: 1,
          createdAt: 1,
          category: 1,
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
        message: ITEMS_MESSAGE.ITEMS_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_NOT_FOUND,
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
/* LIST Items for employees // METHOD: GET */
const listItemsForEmployee = async (req, res) => {
  try {
    let result = await Snacks_Items.aggregate([
      {
        $match: { is_deleted: false, is_available: true },
      },
      {
        $lookup: {
          from: SNACKS_CATEGORY,
          let: { c_id: "$category_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$c_id"] },
                is_deleted: false,
                is_available: true,
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $set: { category: "$category.name" },
      },
      {
        $project: {
          name: 1,
          category_id: 1,
          is_available: 1,
          image: 1,
          price: 1,
          created_by: 1,
          createdAt: 1,
          category: 1,
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    if (result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_NOT_FOUND,
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

/* GET Items // METHOD: GET */
const getItems = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await Snacks_Items.aggregate([
      {
        $match: {
          is_deleted: false,
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: SNACKS_CATEGORY,
          let: { c_id: "$category_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$c_id"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          name: 1,
          category_id: 1,
          is_available: 1,
          image: 1,
          price: 1,
          created_by: 1,
          createdAt: 1,
          category: 1,
        },
      },
    ]);

    if (result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_NOT_FOUND,
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

/* DELETE Items // METHOD: DELETE // PARAMS: _id */
const deleteItems = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    var updatedObj = req.body;
    updatedObj = { ...updatedObj, is_deleted: true, deleted_by: employee_code };
    const items = await Snacks_Items.findByIdAndUpdate(_id, updatedObj);
    if (items) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ITEMS_MESSAGE.ITEMS_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: ITEMS_MESSAGE.ITEMS_NOT_DELETED,
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
  addSnacksItems,
  updateSnacksItems,
  listItems,
  deleteItems,
  getItems,
  listItemsForEmployee,
};
