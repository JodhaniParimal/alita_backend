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
  LEAD,
  EMPLOYEE,
  PLATFORM,
  TECHNOLOGY,
  CLIENT,
} = require("../../constants/models.enum.constants");
const {
  BIDS_MESSAGES,
} = require("../../controller-messages/bids-messages/bids.messages");
const { getCurrentDate, padWithLeadingZeros } = require("../../helpers/fn");
const { Bids } = require("../../models/bids/bids.model");
const Client = require("../../models/client/client.model");
const { ObjectId } = require("mongodb");
const Employee = require("../../models/employee/employee.model");

/* ADD NEW BIDS // METHOD: POST // 
PAYLOAD: {job_title,job_description,client_name,bids_code,job_url,technology,platform_id,rate,country,job_type,status} */
const addBids = async (req, res) => {
  try {
    const {
      job_title,
      client_id,
      job_url,
      technology,
      platform_id,
      rate,
      country,
      job_type,
      status,
    } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    const bid_date = getCurrentDate();

    const getLastBidCode = await Bids.find().sort({ bids_code: -1 }).limit(1);

    const nextNum = getLastBidCode[0]?.bids_code.replace(
      /(\d+)+/g,
      function (match, number) {
        let newCode = padWithLeadingZeros(parseInt(number) + 1, 6);
        return newCode;
      }
    );

    const bids_code = nextNum ? nextNum : "111111";
    const bids = await Bids.create({
      job_title: job_title,
      client_id: client_id,
      bids_code: bids_code,
      job_url: job_url,
      technology: technology,
      platform_id: platform_id,
      rate: rate,
      country: country,
      job_type: job_type,
      status: status,
      bid_date: bid_date,
      bidder_name: employee_code,
      created_by: employee_code,
    });
    if (bids) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: BIDS_MESSAGES.BIDS_CREATED,
        data: bids,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: BIDS_MESSAGES.BIDS_NOT_CREATED,
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

/* UPDATE BIDS // METHOD: PUT // PARAMS: id //
PAYLOAD: {job_title,job_description,client_name,bids_code,job_url,technology,platform_id,rate,country,job_type,status} */
const updateBids = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      job_title,
      client_id,
      bids_code,
      job_url,
      technology,
      platform_id,
      rate,
      country,
      job_type,
      status,
    } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    // const bid_date = getCurrentDate();
    const updatedBid = await Bids.findByIdAndUpdate(
      id,
      {
        job_title: job_title,
        client_id: client_id,
        bids_code: bids_code,
        job_url: job_url,
        technology: technology,
        platform_id: platform_id,
        rate: rate,
        country: country,
        job_type: job_type,
        status: status,
        // bid_date: bid_date,
        // bidder_name: employee_code,
        updated_by: employee_code,
      },
      { new: true }
    );
    if (updatedBid) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: BIDS_MESSAGES.BIDS_UPDATED,
        data: updatedBid,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: BIDS_MESSAGES.BIDS_NOT_UPDATED,
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

/* LIST BIDS BY ID // METHOD: GET // PARAMS: id */
const listBidsById = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = new mongoose.Types.ObjectId(id);
    const listBids = await Bids.aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: TECHNOLOGY,
          let: { id: "$technology" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: 1,
              },
            },
          ],
          as: "technology",
        },
      },
      {
        $lookup: {
          from: CLIENT,
          let: { id: "$client_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
          ],
          as: "client",
        },
      },
      {
        $addFields: {
          client_name: { $arrayElemAt: ["$client.client_name", 0] },
          technology: "$technology.title",
        },
      },
      {
        $project: {
          client: 0,
        },
      },
    ]);
    if (listBids) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: BIDS_MESSAGES.BIDS_FOUND,
        data: listBids[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: BIDS_MESSAGES.BIDS_NOT_FOUND,
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

/* LIST ALL BIDS // METHOD: POST // PAYLOAD: {filter, search, sort, current_page, per_page} */
const listBids = async (req, res) => {
  try {
    const { filter, search, sort, current_page, per_page } = req.body;
    const { date } = filter;

    const current_page_f = current_page || 1;
    const per_page_f = per_page || 25;
    const date_start =
      date && date.start ? date.start : new Date("1947-08-15").getTime();
    const date_end = date && date.end ? date.end : new Date();
    const search_by = search ? search.replace(/[^0-9a-zA-Z]/g, "\\$&") : "";
    const sort_column = sort ? sort.column || "createdAt" : "createdAt";
    const sort_column_key =
      sort_column === "job_title"
        ? "job_title"
        : sort_column === "client_name"
        ? "client_name"
        : sort_column === "bids_code"
        ? "bids_code"
        : sort_column === "job_url"
        ? "job_url"
        : sort_column === "technology"
        ? "technology"
        : sort_column === "rate"
        ? "rate"
        : sort_column === "country"
        ? "country"
        : sort_column === "job_type"
        ? "job_type"
        : sort_column === "bid_date"
        ? "bid_date"
        : sort_column === "bidder_name"
        ? "bidder_name"
        : sort_column === "lead_date"
        ? "lead_date"
        : "createdAt";

    const order_by = sort ? sort.order || -1 : -1;

    let client = [];

    client = await Client.find({
      $or: [{ client_name: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (client.length > 0) {
      client = client.map((o) => o._id);
    }

    let bidderCode = [];

    bidderCode = await Employee.find({
      $or: [{ firstname: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 0, employee_code: 1 });

    if (bidderCode.length > 0) {
      bidderCode = bidderCode.map((o) => o.employee_code);
    }
    console.log("bidderCode", bidderCode);

    const totalCount = await Bids.countDocuments({
      is_deleted: false,
      createdAt: { $gte: new Date(date_start), $lte: new Date(date_end) },
      $or: [
        { job_title: { $regex: `^${search_by}`, $options: "i" } },
        { job_url: { $regex: `^${search_by}`, $options: "i" } },
        { client_name: { $regex: `^${search_by}`, $options: "i" } },
        { client_id: { $in: client } },
        { bidder_name: { $in: bidderCode } },
      ],
    });

    const bidsData = await Bids.aggregate([
      {
        $match: {
          is_deleted: false,
          createdAt: { $gte: new Date(date_start), $lte: new Date(date_end) },
          $or: [
            { job_title: { $regex: `^${search_by}`, $options: "i" } },
            { job_url: { $regex: `^${search_by}`, $options: "i" } },
            { client_name: { $regex: `^${search_by}`, $options: "i" } },
            { client_id: { $in: client } },
            { bidder_name: { $in: bidderCode } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $skip: (current_page_f - 1) * per_page_f,
      },
      {
        $limit: per_page_f,
      },
      {
        $lookup: {
          from: LEAD,
          let: { bid_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$bid_id", "$$bid_id"] },
              },
            },
            { $project: { lead_date: 1, _id: 0 } },
          ],
          as: "lead_date",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { emp: "$bidder_name" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$emp"] },
              },
            },
            { $project: { _id: 0, firstname: 1, lastname: 1 } },
          ],
          as: "bidder_name",
        },
      },
      {
        $lookup: {
          from: TECHNOLOGY,
          let: { id: "$technology" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: 1,
              },
            },
          ],
          as: "technology",
        },
      },
      {
        $addFields: {
          technology: "$technology.title",
        },
      },
      {
        $lookup: {
          from: PLATFORM,
          let: { id: "$platform_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            { $project: { _id: 0, title: { $toString: "$title" } } },
          ],
          as: "platform",
        },
      },
      {
        $lookup: {
          from: CLIENT,
          let: { id: "$client_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
          ],
          as: "client",
        },
      },
      {
        $addFields: {
          client_name: {
            $cond: {
              if: { $gte: [{ $size: "$client" }, 1] },
              then: { $arrayElemAt: ["$client.client_name", 0] },
              else: "---",
            },
          },
          platform_name: { $arrayElemAt: ["$platform.title", 0] },
        },
      },
      {
        $addFields: {
          lead_date: {
            $cond: {
              if: { $gte: [{ $size: "$lead_date" }, 1] },
              then: { $arrayElemAt: ["$lead_date.lead_date", 0] },
              else: "---",
            },
          },
        },
      },
      {
        $addFields: {
          bidder_name: {
            $cond: {
              if: { $gte: [{ $size: "$bidder_name" }, 1] },
              then: {
                $concat: [
                  { $arrayElemAt: ["$bidder_name.firstname", 0] },
                  " ",
                  { $arrayElemAt: ["$bidder_name.lastname", 0] },
                ],
              },
              else: "---",
            },
          },
        },
      },
      {
        $sort: { [sort_column_key]: order_by },
      },
      {
        $project: {
          client: 0,
          platform: 0,
          platform_id: 0,
        },
      },
    ]);

    const total_pages = Math.ceil(totalCount / per_page_f);

    const responsePayload = {
      status:
        bidsData.length > 0
          ? RESPONSE_PAYLOAD_STATUS_SUCCESS
          : RESPONSE_PAYLOAD_STATUS_ERROR,
      message:
        bidsData.length > 0
          ? BIDS_MESSAGES.BIDS_FOUND
          : BIDS_MESSAGES.BIDS_NOT_FOUND,
      data: {
        data: bidsData,
        metaData: {
          per_page: per_page_f,
          total_page: total_pages,
          current_page: current_page_f,
          total_count: totalCount,
        },
      },
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

module.exports = {
  addBids,
  updateBids,
  listBids,
  listBidsById,
};
