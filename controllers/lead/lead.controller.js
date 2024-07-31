const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  BIDS,
  LEAD_COMMENTS,
  SUMMARIES,
  ATTACHMENTS,
  EMPLOYEE,
  ROLE,
  TECHNOLOGY,
  CLIENT,
} = require("../../constants/models.enum.constants");
const {
  LEAD_MESSAGES,
} = require("../../controller-messages/lead-messages/lead.messages");
const { getCurrentDate } = require("../../helpers/fn");
const { Bids } = require("../../models/bids/bids.model");
const Client = require("../../models/client/client.model");
const { Lead } = require("../../models/lead/lead.model");
const { default: mongoose } = require("mongoose");

/* ADD NEW LEAD // METHOD: POST */
/* PAYLOAD: bid_id,lead_code,project_name,lead_assign,client_name,technology,status,discription */
const addLead = async (req, res) => {
  try {
    const {
      bid_id,
      lead_code,
      project_name,
      lead_assign,
      client_id,
      technology,
      status,
      discription,
    } = req.body;
    const lead_date = await getCurrentDate();
    const { employee_code } = req[AUTH_USER_DETAILS];
    const _id = new mongoose.Types.ObjectId(bid_id);
    const bidder = await Bids.findById({ _id });
    const lead = await Lead.create({
      bid_id: bid_id,
      lead_date: lead_date,
      lead_code: lead_code,
      lead_assign: lead_assign,
      employee_code: bidder.bidder_name ? bidder.bidder_name : employee_code,
      project_name: project_name,
      client_id: client_id,
      technology: technology,
      status: status,
      discription: discription,
      created_by: employee_code,
    });
    if (lead) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_CREATED,
        data: lead,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAD_MESSAGES.LEAD_NOT_CREATED,
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

/* UPDATE LEAD // METHOD: PUT in PARAMS lead id */
/* PAYLOAD: bid_id,lead_code,project_name,lead_assign,client_name,technology,status,discription */
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bid_id,
      project_name,
      lead_assign,
      client_id,
      technology,
      status,
      discription,
    } = req.body;
    const lead_date = await getCurrentDate();
    const { employee_code } = req[AUTH_USER_DETAILS];
    const upadteLead = await Lead.findByIdAndUpdate(
      id,
      {
        bid_id: bid_id,
        lead_date: lead_date,
        lead_assign: lead_assign,
        employee_code: employee_code,
        project_name: project_name,
        client_id: client_id,
        technology: technology,
        status: status,
        discription: discription,
        updated_by: employee_code,
      },
      { new: true }
    );
    if (upadteLead) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_UPDATED,
        data: upadteLead,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAD_MESSAGES.LEAD_NOT_UPDATED,
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

/* LIST ALL LEADS // METHOD: POST // PAYLOAD: filter, search, sort, current_page, per_page */
const listLeadTlPm = async (req, res) => {
  try {
    const { filter, search, sort, current_page, per_page, lead_status } =
      req.body;
    const { date } = filter;
    const { role, _id } = req[AUTH_USER_DETAILS];
    let matchLeadAssignObj = {};

    matchLeadAssignObj = { lead_assign: _id };
    if (
      role === LEAD_MESSAGES.CEO ||
      role === LEAD_MESSAGES.CTO ||
      role === LEAD_MESSAGES.ADMIN
      //  ||
      // role === LEAD_MESSAGES.TEAM_LEADER ||
      // role === LEAD_MESSAGES.PROJECT_MANAGER
    ) {
      matchLeadAssignObj = {};
    }
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
        : "createdAt"
      : "createdAt";

    let matchObj = {
      createdAt: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
      is_deleted: false,
      is_disable: false,
    };

    if (lead_status !== "") {
      matchObj.status = lead_status;
    }

    let client = [];

    client = await Client.find({
      $or: [{ client_name: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (client.length > 0) {
      client = client.map((o) => o._id);
    }

    let bids = [];

    bids = await Bids.find({
      $or: [{ job_url: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (bids.length > 0) {
      bids = bids.map((o) => o._id);
    }

    if (search_by != "") {
      matchObj = {
        ...matchObj,
        $or: [
          { lead_codes: { $regex: `${search_by}`, $options: "i" } },
          { project_name: { $regex: `^${search_by}`, $options: "i" } },
          { client_id: { $in: client } },
          { bid_id: { $in: bids } },
        ],
      };
    }
    const order_by = sort.order ? sort.order : -1;

    const totalCount = await Lead.countDocuments({
      ...matchLeadAssignObj,
      ...matchObj,
    });

    let listLead = await Lead.aggregate([
      { $match: matchLeadAssignObj },
      {
        $match: matchObj,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (current_page_f - 1) * per_page_f,
      },
      {
        $limit: per_page_f,
      },
      {
        $lookup: {
          from: LEAD_COMMENTS,
          let: { leadCode: "$lead_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$lead_code", "$$leadCode"] },
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$employee_code", "$$emp"] },
                    },
                  },
                  {
                    $lookup: {
                      from: ROLE,
                      let: { r_id: "$role_id" },
                      pipeline: [
                        {
                          $match: { $expr: { $eq: ["$_id", "$$r_id"] } },
                        },
                      ],
                      as: "role",
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      firstname: 1,
                      lastname: 1,
                      role: { $arrayElemAt: ["$role.role", 0] },
                    },
                  },
                ],
                as: "employee_name",
              },
            },
            {
              $addFields: {
                employee_name: {
                  $cond: {
                    if: { $gte: [{ $size: "$employee_name" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$employee_name.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$employee_name.lastname", 0] },
                      ],
                    },
                    else: "---",
                  },
                },
                roley: {
                  $cond: {
                    if: { $gte: [{ $size: "$employee_name" }, 1] },
                    then: { $arrayElemAt: ["$employee_name.role", 0] },
                    else: "---",
                  },
                },
              },
            },
            {
              $lookup: {
                from: SUMMARIES,
                let: { leadCommentId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$lead_comment_id", "$$leadCommentId"],
                      },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  {
                    $project: {
                      _id: 0,
                      follow_up: 1,
                      follow_up_comment: 1,
                      createdAt: 1,
                    },
                  },
                ],
                as: "summaries",
              },
            },
            {
              $project: {
                _id: 1,
                tech_comment: 1,
                employee_code: 1,
                employee_name: 1,
                roley: 1,
                createdAt: 1,
                summaries: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $addFields: {
          tl_reply: {
            $filter: {
              input: "$comments",
              as: "cmnt",
              cond: {
                $in: ["$$cmnt.roley", ["Team Leader", "Project Manager"]],
              },
            },
          },
          client_reply: {
            $filter: {
              input: "$comments",
              as: "cmnt",
              cond: {
                $in: [
                  "$$cmnt.roley",
                  [
                    "Business Development Manager",
                    "Business Development Executive",
                    "Marketing Lead",
                  ],
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          tl_last_reply_date: {
            $sortArray: {
              input: "$tl_reply",
              sortBy: { createdAt: -1 },
            },
          },
          client_last_reply_date: {
            $sortArray: {
              input: "$client_reply",
              sortBy: { createdAt: -1 },
            },
          },
        },
      },
      {
        $addFields: {
          summaries: { $arrayElemAt: ["$tl_last_reply_date.summaries", 0] },
          tl_last_reply: {
            $cond: {
              if: { $gt: [{ $size: "$tl_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$tl_last_reply_date", 0] },
              else: null,
            },
          },
          tl_last_reply_date: {
            $cond: {
              if: { $gt: [{ $size: "$tl_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$tl_last_reply_date.createdAt", 0] },
              else: null,
            },
          },
          client_last_reply_date: {
            $cond: {
              if: { $gt: [{ $size: "$client_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$client_last_reply_date.createdAt", 0] },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: BIDS,
          localField: "bid_id",
          foreignField: "_id",
          as: "bids",
        },
      },
      {
        $addFields: {
          job_title: {
            $ifNull: [{ $arrayElemAt: ["$bids.job_title", 0] }, "---"],
          },
          job_url: { $ifNull: [{ $arrayElemAt: ["$bids.job_url", 0] }, "---"] },
          rate: { $ifNull: [{ $arrayElemAt: ["$bids.rate", 0] }, "---"] },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$employee_code", "$$e_code"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                name: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "applicant_name",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$lead_assign" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$e_code"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "lead_assign",
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
          technology: "$technology.title",
        },
      },
      {
        $addFields: {
          lead_codes: { $toString: "$lead_code" },
        },
      },
      {
        $sort: { [sort_column]: order_by },
      },
      {
        $project: {
          _id: 1,
          bid_id: 1,
          lead_date: 1,
          lead_code: 1,
          lead_assign: 1,
          employee_code: 1,
          tl_last_reply: 1,
          project_name: 1,
          project_count: 1,
          client_name: 1,
          client_id: 1,
          technology: 1,
          applicant_name: { $arrayElemAt: ["$applicant_name.name", 0] },
          status: 1,
          discription: 1,
          tl_last_reply_date: 1,
          client_last_reply_date: 1,
          summaries: 1,
          job_title: 1,
          job_url: 1,
          rate: 1,
          createdAt: 1,
        },
      },
    ]);
    const total_pages = Math.ceil(totalCount / per_page_f);
    const responsePayload = {
      status:
        // listLead.length > 0
        // ?
        RESPONSE_PAYLOAD_STATUS_SUCCESS,
      // : RESPONSE_PAYLOAD_STATUS_ERROR,
      message:
        listLead.length > 0
          ? LEAD_MESSAGES.LEAD_FOUND
          : LEAD_MESSAGES.LEAD_NOT_FOUND,
      data: {
        data: listLead,
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

/* LIST ALL LEADS // METHOD: POST // PAYLOAD: filter, search, sort, current_page, per_page */
const listLead = async (req, res) => {
  try {
    const { filter, search, sort, current_page, per_page, lead_status } =
      req.body;
    const { date } = filter;
    const { role, _id } = req[AUTH_USER_DETAILS];
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
        : "createdAt"
      : "createdAt";
    let matchObj = {
      createdAt: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
      is_deleted: false,
      is_disable: false,
    };

    if (lead_status !== "") {
      matchObj.status = lead_status;
    }

    let client = [];

    client = await Client.find({
      $or: [{ client_name: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (client.length > 0) {
      client = client.map((o) => o._id);
    }

    let bids = [];

    bids = await Bids.find({
      $or: [{ job_url: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (bids.length > 0) {
      bids = bids.map((o) => o._id);
    }

    if (search_by != "") {
      matchObj = {
        ...matchObj,
        $or: [
          { lead_codes: { $regex: `${search_by}`, $options: "i" } },
          { project_name: { $regex: `^${search_by}`, $options: "i" } },
          { client_id: { $in: client } },
          { bid_id: { $in: bids } },
        ],
      };
    }

    const order_by = sort.order ? sort.order : -1;

    const totalCount = await Lead.countDocuments({
      ...matchObj,
    });

    let listLead = await Lead.aggregate([
      { $match: matchObj },
      { $sort: { createdAt: -1 } },
      {
        $skip: (current_page_f - 1) * per_page_f,
      },
      {
        $limit: per_page_f,
      },
      {
        $lookup: {
          from: LEAD_COMMENTS,
          let: { leadCode: "$lead_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$lead_code", "$$leadCode"] },
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$employee_code", "$$emp"] },
                    },
                  },
                  {
                    $lookup: {
                      from: ROLE,
                      let: { r_id: "$role_id" },
                      pipeline: [
                        {
                          $match: { $expr: { $eq: ["$_id", "$$r_id"] } },
                        },
                      ],
                      as: "role",
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      firstname: 1,
                      lastname: 1,
                      role: { $arrayElemAt: ["$role.role", 0] },
                    },
                  },
                ],
                as: "employee_name",
              },
            },
            {
              $addFields: {
                employee_name: {
                  $cond: {
                    if: { $gte: [{ $size: "$employee_name" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$employee_name.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$employee_name.lastname", 0] },
                      ],
                    },
                    else: "---",
                  },
                },
                roley: {
                  $cond: {
                    if: { $gte: [{ $size: "$employee_name" }, 1] },
                    then: { $arrayElemAt: ["$employee_name.role", 0] },
                    else: "---",
                  },
                },
              },
            },
            {
              $lookup: {
                from: SUMMARIES,
                let: { leadCommentId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$lead_comment_id", "$$leadCommentId"],
                      },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  {
                    $project: {
                      _id: 0,
                      follow_up: 1,
                      follow_up_comment: 1,
                      createdAt: 1,
                    },
                  },
                ],
                as: "summaries",
              },
            },
            {
              $project: {
                _id: 1,
                tech_comment: 1,
                employee_code: 1,
                employee_name: 1,
                roley: 1,
                createdAt: 1,
                summaries: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $addFields: {
          tl_reply: {
            $filter: {
              input: "$comments",
              as: "cmnt",
              cond: {
                $in: ["$$cmnt.roley", ["Team Leader", "Project Manager"]],
              },
            },
          },
          client_reply: {
            $filter: {
              input: "$comments",
              as: "cmnt",
              cond: {
                $in: [
                  "$$cmnt.roley",
                  [
                    "Business Development Manager",
                    "Business Development Executive",
                    "Marketing Lead",
                  ],
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          tl_last_reply_date: {
            $sortArray: {
              input: "$tl_reply",
              sortBy: { createdAt: -1 },
            },
          },
          client_last_reply_date: {
            $sortArray: {
              input: "$client_reply",
              sortBy: { createdAt: -1 },
            },
          },
        },
      },
      {
        $addFields: {
          summaries: { $arrayElemAt: ["$tl_last_reply_date.summaries", 0] },
          tl_last_reply: {
            $cond: {
              if: { $gt: [{ $size: "$tl_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$tl_last_reply_date", 0] },
              else: null,
            },
          },
          tl_last_reply_date: {
            $cond: {
              if: { $gt: [{ $size: "$tl_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$tl_last_reply_date.createdAt", 0] },
              else: null,
            },
          },
          client_last_reply_date: {
            $cond: {
              if: { $gt: [{ $size: "$client_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$client_last_reply_date.createdAt", 0] },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: BIDS,
          localField: "bid_id",
          foreignField: "_id",
          as: "bids",
        },
      },
      {
        $addFields: {
          job_title: {
            $ifNull: [{ $arrayElemAt: ["$bids.job_title", 0] }, "---"],
          },
          job_url: { $ifNull: [{ $arrayElemAt: ["$bids.job_url", 0] }, "---"] },
          rate: { $ifNull: [{ $arrayElemAt: ["$bids.rate", 0] }, "---"] },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$employee_code", "$$e_code"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                name: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "applicant_name",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$lead_assign" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$e_code"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "lead_assign",
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
          technology: "$technology.title",
        },
      },
      {
        $addFields: {
          lead_codes: { $toString: "$lead_code" },
        },
      },
      {
        $sort: { [sort_column]: order_by },
      },
      {
        $project: {
          _id: 1,
          lead_code: 1,
          lead_assign: 1,
          project_name: 1,
          tl_last_reply: 1,
          project_count: 1,
          client_id: 1,
          client_name: 1,
          technology: 1,
          applicant_name: { $arrayElemAt: ["$applicant_name.name", 0] },
          status: 1,
          tl_last_reply_date: 1,
          client_last_reply_date: 1,
          summaries: 1,
          job_title: 1,
          job_url: 1,
          rate: 1,
          createdAt: 1,
        },
      },
    ]);
    const total_pages = Math.ceil(totalCount / per_page_f);
    const responsePayload = {
      status:
        // listLead.length > 0
        // ?
        RESPONSE_PAYLOAD_STATUS_SUCCESS,
      // : RESPONSE_PAYLOAD_STATUS_ERROR,
      message:
        listLead.length > 0
          ? LEAD_MESSAGES.LEAD_FOUND
          : LEAD_MESSAGES.LEAD_NOT_FOUND,
      data: {
        data: listLead,
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

/* LIST LEAD BY ID // METHOD: GET // PARAMS: id */
const listLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = new mongoose.Types.ObjectId(id);
    // const _id = new ObjectId(id);

    const listLead = await Lead.aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: LEAD_COMMENTS,
          let: { l_code: "$lead_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$l_code", "$lead_code"],
                },
                is_deleted: false,
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$employee_code", "$$emp"] },
                    },
                  },
                  { $project: { _id: 0, firstname: 1, lastname: 1 } },
                ],
                as: "employee_name",
              },
            },
            {
              $addFields: {
                employee_name: {
                  $cond: {
                    if: { $gte: [{ $size: "$employee_name" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$employee_name.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$employee_name.lastname", 0] },
                      ],
                    },
                    else: "---",
                  },
                },
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                tech_comment: 1,
                lead_code: 1,
                employee_code: 1,
                employee_name: 1,
                createdAt: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $lookup: {
          from: ATTACHMENTS,
          let: { l_code: "$lead_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$l_code", "$lead_code"],
                },
                path: { $exists: true },
                is_deleted: false,
              },
            },
            {
              $project: {
                path: 1,
                lead_code: 1,
                createdAt: 1,
              },
            },
          ],
          as: "attachments",
        },
      },
      {
        $lookup: {
          from: BIDS,
          localField: "bid_id",
          foreignField: "_id",
          as: "bids",
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
          _id: 1,
          bid_id: 1,
          lead_date: 1,
          lead_code: 1,
          employee_code: 1,
          project_name: 1,
          project_count: 1,
          lead_assign: 1,
          client_name: 1,
          client_id: 1,
          technology: 1,
          status: 1,
          discription: 1,
          is_disable: 1,
          is_deleted: 1,
          updated_by: 1,
          created_by: 1,
          createdAt: 1,
          updatedAt: 1,
          comments: 1,
          attachments: 1,
          job_url: { $ifNull: [{ $arrayElemAt: ["$bids.job_url", 0] }, "---"] },
          rate: { $ifNull: [{ $arrayElemAt: ["$bids.rate", 0] }, "---"] },
        },
      },
    ]);

    if (listLead && listLead.length > 0) {
      const responsePayload = {
        success: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_FOUND,
        data: listLead[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        success: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      success: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* LIST LEAD CODE // METHOD: GET */
const listLeadCode = async (req, res) => {
  try {
    const LeadCode = await Lead.find({});
    const LeadCodeList = LeadCode.map((lead) => lead.lead_code);

    if (LeadCodeList.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAD_MESSAGES.LEAD_CODE_FOUND,
        data: LeadCodeList,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: LEAD_MESSAGES.LEAD_CODE_NOT_FOUND,
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

module.exports = {
  addLead,
  updateLead,
  listLead,
  listLeadById,
  listLeadCode,
  listLeadTlPm,
};
