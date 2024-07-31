const moment = require("moment");

const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
} = require("../../../constants/global.constants");
const {
  ORDER_MESSAGE,
} = require("../../../controller-messages/snacks-messages/order.messages");
const { Snacks_Orders } = require("../../../models/snacks/order.model");
const { getDates, genratePdf } = require("../../../helpers/fn");
const {
  EMPLOYEE,
  SNACKS_ITEMS,
  SNACKS_CATEGORY,
} = require("../../../constants/models.enum.constants");
const { ENUMS } = require("../../../constants/enum.constants");
const { Snacks_Category } = require("../../../models/snacks/category.model");

/* LIST TODAY'S ORDERS // METHOD: GET */
const listTodaysOrderReport = async () => {
  try {
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 0);

    let getOrder = await Snacks_Orders.aggregate([
      {
        $match: {
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
              $project: {
                _id: 0,
                name: 1,
                category: 1,
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
        $group: {
          _id: "$items.name",
          category: { $first: "$items.category.name" },
          item_name: { $first: "$items.name" },
          item_price: { $first: "$order_items.item_price" },
          qty: { $sum: "$order_items.quantity" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          item_name: 1,
          item_price: 1,
          quantity: "$qty",
          total: {
            $multiply: ["$qty", "$item_price"],
          },
        },
      },
    ]);

    if (getOrder.length) {
      let newArr = { quantity: 0, total: 0, items: [] };
      getOrder.forEach((e) => {
        newArr.quantity += e.quantity;
        newArr.total += e.total;
        newArr.items.push(e);
      });

      return { status: 1, result: newArr };
    } else {
      return { status: 0, result: {} };
    }
  } catch (error) {
    return { status: 0, error: 1 };
  }
};

/* GET ALL TODAY'S ORDERS // METHOD: GET */
const todaysOrderReport = async (req, res) => {
  try {
    let getOrders = await listTodaysOrderReport();
    if (getOrders.error) {
      throw new Error();
    }
    if (getOrders.status) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_FOUND,
        data: getOrders.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* GENERATE PDF OF TODAY'S ORDERS // METHOD: GET */
const generatePDFOfTodaysOrderReport = async (req, res) => {
  try {
    let getOrders = await listTodaysOrderReport();
    if (getOrders.error) {
      throw new Error();
    }
    if (getOrders.status) {
      let newArr = getOrders.result;
      newArr.total = parseFloat(newArr.total).toFixed(2);
      newArr.items.forEach((e) => {
        e.item_price = parseFloat(e.item_price).toFixed(2);
        e.total = parseFloat(e.total).toFixed(2);
      });

      genratePdf("todaysOrder", newArr)
        .then((pdf) => {
          if (pdf) {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_EXPORTED,
              data: pdf.toString("base64"),
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          } else {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_NOT_EXPORTED,
              data: null,
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          }
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* LIST ITEM WISE EVERYDAY REPORT BETWEEN DATES // METHOD: POST */
const listFoodReportOfEmployees = async (date) => {
  try {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var end = new Date();
    end.setHours(23, 59, 59, 0);

    const date_start = date ? (date.start ? date.start : start) : start;
    const date_end = date ? (date.end ? date.end : end) : end;

    let getOrder = await Snacks_Orders.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gte: new Date(date_start),
              $lte: new Date(date_end),
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
          $lookup: {
            from: EMPLOYEE,
            let: { e_code: "$employee_code" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$employee_code", "$$e_code"] },
                  is_deleted: false,
                },
              },
              {
                $project: {
                  _id: 0,
                  fullname: { $concat: ["$firstname", " ", "$lastname"] },
                },
              },
            ],
            as: "employee_details",
          },
        },
        {
          $unwind: "$employee_details",
        },
        {
          $group: {
            _id: "$employee_code",
            employee_code: { $first: "$employee_code" },
            employee_name: { $first: "$employee_details.fullname" },
            difference_amount: { $first: "$difference_amount" },
            total: { $first: "$total" },
            quantity: { $sum: "$order_items.quantity" },
            order_items: { $push: "$order_items" },
          },
        },
        {
          $project: {
            _id: 0,
            employee_code: 1,
            employee_name: 1,
            order_items: 1,
            quantity: 1,
            difference_amount: 1,
            total: 1,
          },
        },
        {
          $sort: { employee_name: 1 },
        },
      ],
      {
        collation: { locale: "de@collation=phonebook" },
      }
    );

    if (getOrder.length) {
      let tot = 0,
        qty = 0;
      getOrder.forEach((e) => {
        (qty += e.quantity), (tot += e.total);
      });
      getOrder = {
        quantity: parseInt(qty),
        total: parseInt(tot),
        data: [...getOrder],
      };
      return { status: 1, result: getOrder };
    } else {
      return { status: 0, result: [] };
    }
  } catch (error) {
    return { status: 0, error: 1 };
  }
};

/* ITEM WISE EVERYDAY REPORT BETWEEN DATES // METHOD: POST */
const foodReportOfEmployees = async (req, res) => {
  try {
    const { date } = req.body;
    let getOrder = await listFoodReportOfEmployees(date);
    if (getOrder.error) {
      throw new Error();
    }
    if (getOrder.status) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_FOUND,
        data: getOrder.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* GENERATE PDF OF TODAY'S ORDERS // METHOD: GET */
const generatePDFOfFoodReport = async (req, res) => {
  try {
    const { date } = req.body;
    let getOrders = await listFoodReportOfEmployees(date);
    if (getOrders.error) {
      throw new Error();
    }
    if (getOrders.status) {
      let newArr = getOrders.result;
      newArr.total = parseFloat(newArr.total).toFixed(2);
      newArr.data.forEach((el) => {
        el.total = parseFloat(el.total).toFixed(2);
        el.difference_amount = parseFloat(el.difference_amount).toFixed(2);
        el.order_items.forEach((e) => {
          e.item_price = parseFloat(e.item_price).toFixed(2);
          e.total = parseFloat(e.total).toFixed(2);
        });
      });

      genratePdf("foodOrder", newArr)
        .then((pdf) => {
          if (pdf) {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_EXPORTED,
              data: pdf.toString("base64"),
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          } else {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_NOT_EXPORTED,
              data: null,
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          }
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* LIST TOTAL ORDER AMOUNT OF PARTICULAR MONTH OF YEAR // METHOD: POST */
const listDateWiseMonthlyOrderReport = async (month, year) => {
  try {
    month = month ? month : new Date().getMonth() + 1;
    year = year ? year : new Date().getFullYear();

    const startOfMonth = moment([year, month - 1]);
    const endOfMonth = moment(startOfMonth).endOf("month");

    var date_start = startOfMonth.format("YYYY-MM-DD HH:mm:ss"),
      date_end = endOfMonth.format("YYYY-MM-DD HH:mm:ss");

    const dateArray = getDates(date_start, date_end);

    let getOrder = await Snacks_Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          total: { $sum: "$total" },
          difference_amount: { $sum: "$difference_amount" },
          sum: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          createdAt: "$_id",
          difference_amount: 1,
          total: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          stats: {
            $map: {
              input: dateArray,
              as: "createdAt",
              in: {
                $let: {
                  vars: {
                    dateIndex: { $indexOfArray: ["$stats._id", "$$createdAt"] },
                  },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$stats", "$$dateIndex"] },
                      else: {
                        _id: "$$createdAt",
                        createdAt: "$$createdAt",
                        total: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$stats",
      },
      {
        $replaceRoot: {
          newRoot: "$stats",
        },
      },
      {
        $project: {
          _id: 0,
          createdAt: 1,
          total: 1,
        },
      },
    ]);

    if (getOrder.length == 0) {
      dateArray.forEach((e) => {
        getOrder.push({ createdAt: e, total: 0 });
      });
    }

    let tot = 0;
    getOrder.forEach((e) => (tot += e.total));
    getOrder = { total: tot, data: [...getOrder] };

    return { status: 1, result: getOrder };
  } catch (error) {
    return { status: 0, error: 1 };
  }
};

/* TOTAL ORDER AMOUNT OF PARTICULAR MONTH OF YEAR // METHOD: POST */
const dateWiseMonthlyOrderReport = async (req, res) => {
  try {
    const { month, year } = req.body;
    let getOrder = await listDateWiseMonthlyOrderReport(month, year);
    if (getOrder.error) {
      throw new Error();
    }
    if (getOrder.status) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_FOUND,
        data: getOrder.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: null,
        data: [],
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* GENERATE PDF OF TOTAL ORDER AMOUNT OF PARTICULAR MONTH OF YEAR // METHOD: POST */
const generatePDFOfdateWiseMonthlyOrderReport = async (req, res) => {
  try {
    const { month, year } = req.body;
    let getOrders = await listDateWiseMonthlyOrderReport(month, year);
    if (getOrders.error) {
      throw new Error();
    }
    if (getOrders.status) {
      getOrders.result.data.forEach((e) => {
        e.createdAt = moment(e.createdAt).format("DD/MM/YYYY");
      });
      genratePdf("monthlyOrder", getOrders.result)
        .then((pdf) => {
          if (pdf) {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_EXPORTED,
              data: pdf.toString("base64"),
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          } else {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_NOT_EXPORTED,
              data: null,
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          }
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* LIST TOTAL ORDER AMOUNT OF PARTICULAR EMPLOYEE OF MONTH OF YEAR // METHOD: POST */
const listEmployeeWiseMonthlyOrderReport = async (month, year) => {
  try {
    month = month ? month : new Date().getMonth() + 1;
    year = year ? year : new Date().getFullYear();

    const startOfMonth = moment([year, month - 1]);
    const endOfMonth = moment(startOfMonth).endOf("month");

    var date_start = startOfMonth.format("YYYY-MM-DD HH:mm:ss"),
      date_end = endOfMonth.format("YYYY-MM-DD HH:mm:ss");

    let getOrder = await Snacks_Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$e_code"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                fullname: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "employee_details",
        },
      },
      {
        $unwind: "$employee_details",
      },
      {
        $group: {
          _id: "$employee_code",
          name: { $first: "$employee_details.fullname" },
          total: { $sum: "$total" },
          difference_amount: { $sum: "$difference_amount" },
          sum: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          total: 1,
          difference_amount: 1,
        },
      },
    ]);

    if (getOrder.length) {
      let tot = 0,
        diff = 0;
      getOrder.forEach((e) => {
        (tot += e.total), (diff += e.difference_amount);
      });
      getOrder = {
        total: tot,
        difference_amount: diff,
        data: [...getOrder],
      };
      return { status: 1, result: getOrder };
    } else {
      return { status: 0, result: [] };
    }
  } catch (error) {
    return { status: 0, error: 1 };
  }
};

/* TOTAL ORDER AMOUNT OF PARTICULAR EMPLOYEE OF MONTH OF YEAR // METHOD: POST */
const employeeWiseMonthlyOrderReport = async (req, res) => {
  try {
    const { month, year } = req.body;

    let getOrder = await listEmployeeWiseMonthlyOrderReport(month, year);
    if (getOrder.error) {
      throw new Error();
    }

    if (getOrder.status) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_FOUND,
        data: getOrder.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* GENERATE PDF OF TOTAL ORDER AMOUNT OF PARTICULAR EMPLOYEE OF MONTH OF YEAR // METHOD: POST */
const generatePDFOfEmployeeWiseMonthlyOrderReport = async (req, res) => {
  try {
    const { month, year } = req.body;

    let getOrder = await listEmployeeWiseMonthlyOrderReport(month, year);
    if (getOrder.error) {
      throw new Error();
    }

    if (getOrder.status) {
      getOrder.result.total = parseFloat(getOrder.result.total).toFixed(2);
      getOrder.result.difference_amount = parseFloat(
        getOrder.result.difference_amount
      ).toFixed(2);
      getOrder.result.data.forEach((e) => {
        e.total = parseFloat(e.total).toFixed(2);
        e.difference_amount = parseFloat(e.difference_amount).toFixed(2);
      });
      genratePdf("employeeWiseOrder", getOrder.result)
        .then((pdf) => {
          if (pdf) {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_EXPORTED,
              data: pdf.toString("base64"),
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          } else {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_NOT_EXPORTED,
              data: null,
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          }
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* LIST MONTHLY DAY WISE ORDER OF EMPLOYEE // METHOD: POST */
const listMonthlyDayWiseOrderReport = async (month, year) => {
  try {
    month = month ? month : new Date().getMonth() + 1;
    year = year ? year : new Date().getFullYear();

    const startOfMonth = moment([year, month - 1]);
    const endOfMonth = moment(startOfMonth).endOf("month");

    var date_start = startOfMonth.format("YYYY-MM-DD HH:mm:ss"),
      date_end = endOfMonth.format("YYYY-MM-DD HH:mm:ss");

    let getCategoryPrice = await Snacks_Category.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: null, sum: { $sum: "$price_per_category" } } },
      { $project: { _id: 0, sum: 1 } },
    ]);

    let category_price = getCategoryPrice[0].sum;

    let getOrder = await Snacks_Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$e_code"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                fullname: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "employee_details",
        },
      },
      {
        $unwind: "$employee_details",
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          employees: {
            $push: {
              employee_code: "$employee_code",
              employee_name: "$employee_details.fullname",
              total: { $sum: "$total" },
              difference_amount: { $sum: "$difference_amount" },
              accepted_amount: category_price,
            },
          },
          sum: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          createdAt: "$_id",
          employees: 1,
          total: { $sum: "$employees.total" },
          total_diff: { $sum: "$employees.difference_amount" },
        },
      },
    ]);

    if (getOrder.length) {
      let final_total = 0,
        final_difference = 0;
      getOrder.forEach((e) => {
        (final_total += e.total), (final_difference += e.total_diff);
      });
      getOrder = {
        total: final_total,
        difference_amount: final_difference,
        data: [...getOrder],
      };
      return { status: 1, result: getOrder };
    } else {
      return { status: 0, result: [] };
    }
  } catch (error) {
    return { status: 0, error: 1, message: error };
  }
};

/* MONTHLY DAY WISE ORDER OF EMPLOYEE // METHOD: POST */
const monthlyDayWiseOrderReport = async (req, res) => {
  try {
    const { month, year } = req.body;

    let getOrder = await listMonthlyDayWiseOrderReport(month, year);
    if (getOrder.error) {
      throw new Error(getOrder.message);
    }

    if (getOrder.status) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ORDER_MESSAGE.ORDER_FOUND,
        data: getOrder.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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

/* GENERATE PDF OF MONTHLY DAY WISE ORDER OF EMPLOYEE // METHOD: POST */
const generatePDFOfMonthlyDayWiseOrderReport = async (req, res) => {
  try {
    const { month, year } = req.body;

    let getOrder = await listMonthlyDayWiseOrderReport(month, year);
    if (getOrder.error) {
      throw new Error();
    }

    if (getOrder.status) {
      getOrder.result.total = parseFloat(getOrder.result.total).toFixed(2);
      getOrder.result.difference_amount = parseFloat(
        getOrder.result.difference_amount
      ).toFixed(2);
      getOrder.result.data.forEach((e) => {
        e.createdAt = moment(e.createdAt).format("DD/MM/YYYY");
        if (e.employees.length) {
          e.employees.forEach((el) => {
            el.total = parseFloat(el.total).toFixed(2);
            el.difference_amount = parseFloat(el.difference_amount).toFixed(2);
          });
        }
      });
      genratePdf("monthlyDayOrder", getOrder.result)
        .then((pdf) => {
          if (pdf) {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_EXPORTED,
              data: pdf.toString("base64"),
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          } else {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ORDER_MESSAGE.PDF_NOT_EXPORTED,
              data: null,
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          }
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: [],
        error: ORDER_MESSAGE.ORDER_NOT_FOUND,
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
  todaysOrderReport,
  generatePDFOfTodaysOrderReport,
  foodReportOfEmployees,
  generatePDFOfFoodReport,
  dateWiseMonthlyOrderReport,
  generatePDFOfdateWiseMonthlyOrderReport,
  employeeWiseMonthlyOrderReport,
  generatePDFOfEmployeeWiseMonthlyOrderReport,
  monthlyDayWiseOrderReport,
  generatePDFOfMonthlyDayWiseOrderReport,
};
