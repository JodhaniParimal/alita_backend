const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../../constants/global.constants");
const {
  ORDER_MESSAGE,
} = require("../../../controller-messages/snacks-messages/order.messages");
const { Snacks_Orders } = require("../../../models/snacks/order.model");
const { Snacks_Items } = require("../../../models/snacks/items.model");
const { Snacks_Category } = require("../../../models/snacks/category.model");
const {
  SNACKS_ITEMS,
  SNACKS_CATEGORY,
} = require("../../../constants/models.enum.constants");
const { default: mongoose } = require("mongoose");
const { groupBy } = require("../../../helpers/fn");
const { ENUMS } = require("../../../constants/enum.constants");

/* ORDER Items // METHOD: POST */
/* PAYLOAD: { order_items: [{"item_id": "", "item_price": 10, "quantity": 1}] } */
const checkoutOrderItems = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    let { order_items } = req.body;

    const currentTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentHour = new Date(currentTime).getHours();

    if (currentHour >= 14 && currentHour <= 15) {
      if (!order_items || order_items.length == 0) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: ORDER_MESSAGE.ORDER_ITEMS_NOT_FOUND,
          data: null,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }

      var start = new Date();
      start.setHours(0, 0, 0, 0);
      var end = new Date();
      end.setHours(23, 59, 59, 999);

      let getOrder = await Snacks_Orders.findOne({
        employee_code: employee_code,
        createdAt: { $gte: start, $lt: end },
      });

      var newOrder = JSON.parse(JSON.stringify(getOrder));

      let total = 0,
        difference_amount = 0,
        itemIds = [];

      order_items.forEach((element) => {
        total += element.item_price * element.quantity;
        itemIds.push(new mongoose.Types.ObjectId(element.item_id));
      });

      if (getOrder) {
        total += newOrder.total;
        difference_amount += newOrder.difference_amount;
        order_items.forEach((e) => {
          if (newOrder.order_items.some((el) => el.item_id == e.item_id)) {
            newOrder.order_items.find(
              (el) => el.item_id == e.item_id
            ).quantity += e.quantity;
          } else {
            newOrder.order_items.push(e);
          }
        });
        order_items = newOrder.order_items;
        itemIds + newOrder.order_items.map((el) => el.item_id);
      }

      getOrder = JSON.parse(JSON.stringify(getOrder));

      let getAllCategoriesTotal = await Snacks_Category.find({
        is_deleted: false,
        is_available: true,
      }).select({ price_per_category: 1 });

      let categoryTotal = 0;
      if (getAllCategoriesTotal) {
        getAllCategoriesTotal.forEach(
          (e) => (categoryTotal += e.price_per_category)
        );
      }

      let getItems = await Snacks_Items.aggregate([
        {
          $match: {
            _id: { $in: itemIds },
            is_deleted: false,
          },
        },
        {
          $lookup: {
            from: SNACKS_CATEGORY,
            let: { i_id: "$category_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$i_id"] },
                  is_deleted: false,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                  price_per_category: 1,
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
            category_name: "$category.name",
            category_price: "$category.price_per_category",
            is_available: 1,
            price: 1,
            image: 1,
          },
        },
      ]);

      let listCategories = groupBy(getItems, "category_id");
      let listCategoryIds = Object.keys(listCategories);
      listCategoryIds.forEach((e) => {
        let listItems = listCategories[e];
        let itemDetails = order_items.find((el) =>
          listItems.some((ell) => el.item_id == ell._id)
        );

        let totalOfItems = listItems.reduce(
          (acc, curr) => acc + curr.price * itemDetails.quantity,
          0
        );

        let category_price = listItems.find((el) =>
          order_items.some((ell) => el._id == ell.item_id)
        ).category_price;

        if (getOrder) {
          let orderItem = getOrder.order_items.find(
            (el) => el.item_id == itemDetails.item_id
          );
          let newOrderItem = order_items.find(
            (el) => el.item_id == itemDetails.item_id
          );

          if (orderItem) {
            if (totalOfItems > category_price) {
              difference_amount +=
                newOrderItem.quantity * newOrderItem.item_price -
                orderItem.quantity * orderItem.item_price;
            }
          } else {
            if (total > categoryTotal) {
              difference_amount = total - categoryTotal;
            } else {
              difference_amount += totalOfItems - category_price;
            }
          }
        } else {
          difference_amount += totalOfItems - category_price;
        }
      });

      let result;
      if (getOrder) {
        if (difference_amount <= 0) {
          difference_amount = getOrder.difference_amount;
        }
        await Snacks_Orders.updateMany(
          { _id: getOrder._id },
          {
            $set: {
              order_items: order_items,
            },
            total: total,
            difference_amount: difference_amount,
            updated_by: employee_code,
          }
        );
        result = await Snacks_Orders.findOne({ _id: getOrder._id });
      } else {
        result = await Snacks_Orders.create({
          employee_code: employee_code,
          order_items: order_items,
          total: total,
          difference_amount: difference_amount,
          created_by: employee_code,
        });
      }
      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: ORDER_MESSAGE.ORDER_ADDED,
          data: result,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: ORDER_MESSAGE.ORDER_NOT_ADDED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: ORDER_MESSAGE.ORDER_BETWEEN,
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

/* GET EMPLOYEE'S TODAY'S ORDERS // METHOD: POST */
const getEmployeeOrders = async (req, res) => {
  try {
    const { date } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];

    var start = new Date(date);
    start.setHours(0, 0, 0, 0);
    var end = new Date(date);
    end.setHours(23, 59, 59, 999);

    let getOrder = await Snacks_Orders.aggregate([
      {
        $match: {
          employee_code: employee_code,
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
      },
      {
        $unwind: "$order_items",
      },
      {
        $lookup: {
          from: SNACKS_ITEMS,
          let: { i_id: "$order_items.item_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$i_id"] },
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
          as: "items",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $set: {
          "order_items.item_name": "$items.name",
          "order_items.total": {
            $multiply: ["$order_items.item_price", "$order_items.quantity"],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          employee_code: { $first: "$employee_code" },
          total: { $first: "$total" },
          difference_amount: { $first: "$difference_amount" },
          order_items: { $push: "$order_items" },
        },
      },
      {
        $project: {
          employee_code: 1,
          total: 1,
          difference_amount: 1,
          order_items: 1,
        },
      },
    ]);

    if (getOrder.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_FOUND,
        data: getOrder[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* DELETE ORDER ITEMS // METHOD: GET // PARAMS: item_id */
const deleteOrderItems = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { item_id } = req.params;

    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var end = new Date();
    end.setHours(23, 59, 59, 999);

    let getOrder = await Snacks_Orders.findOne({
      employee_code: employee_code,
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
      "order_items.item_id": item_id,
    });
    getOrder = JSON.parse(JSON.stringify(getOrder));
    if (getOrder) {
      let itemDetails = getOrder.order_items.find((e) => e.item_id == item_id);
      let newTotal = 0,
        newDiff = 0;
      if (getOrder.difference_amount > 0) {
        let itemIds = getOrder.order_items
          .filter((e) => e.item_id != item_id)
          .map((e) => new mongoose.Types.ObjectId(e.item_id));

        let getItems = await Snacks_Items.aggregate([
          {
            $match: {
              _id: { $in: itemIds },
              is_deleted: false,
            },
          },
          {
            $lookup: {
              from: SNACKS_CATEGORY,
              let: { i_id: "$category_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$i_id"] },
                    is_deleted: false,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    price_per_category: 1,
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
              category_name: "$category.name",
              category_price: "$category.price_per_category",
              is_available: 1,
              price: 1,
              image: 1,
            },
          },
        ]);

        let listCategories = groupBy(getItems, "category_id");
        let listCategoryIds = Object.keys(listCategories);

        listCategoryIds.forEach((e) => {
          let listItems = listCategories[e];
          let itemDetails = getOrder.order_items.find((el) =>
            listItems.some((ell) => el.item_id == ell._id)
          );

          let totalOfItems = listItems.reduce(
            (acc, curr) => acc + curr.price * itemDetails.quantity,
            0
          );

          let category_price = listItems.find((el) =>
            getOrder.order_items.some((ell) => el._id == ell.item_id)
          ).category_price;

          if (totalOfItems > category_price) {
            newDiff += totalOfItems - category_price;
          }
        });
        newTotal =
          getOrder.total - itemDetails.quantity * itemDetails.item_price;
      } else {
        newTotal =
          getOrder.total - itemDetails.quantity * itemDetails.item_price;
        newDiff = getOrder.difference_amount;
      }
      await Snacks_Orders.findByIdAndUpdate(
        getOrder._id,
        {
          $pull: { order_items: { item_id: item_id } },
          total: newTotal,
          difference_amount: newDiff,
        },
        { new: true }
      );
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_ITEM_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ORDER_MESSAGE.ORDER_ITEM_NOT_FOUND,
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
  checkoutOrderItems,
  getEmployeeOrders,
  deleteOrderItems,
};
