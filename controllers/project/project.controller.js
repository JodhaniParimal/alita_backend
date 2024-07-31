const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  PROJECT_MESSAGES,
} = require("../../controller-messages/project-messages/project.messages");
const { getCurrentDate } = require("../../helpers/fn");
const {
  EMPLOYEE_PROJECT,
  EMPLOYEE,
  TECHNOLOGY,
  ADD_HOURS,
  LEAD,
  CLIENT,
} = require("../../constants/models.enum.constants");
const { Lead } = require("../../models/lead/lead.model");
const {
  Employee_Project,
} = require("../../models/project/employee.project.model");
const { Project } = require("../../models/project/project.model");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const Client = require("../../models/client/client.model");

/* ADD NEW PROJECT // METHOD: POST */
/* PAYLOAD: project_code,lead_code,technology,estimated_hours,remaining_hours,weekly_limit_summary,tracker_status,client_name,project_title,status,nda,nda_status,project_rate,project_assign */
const addProject = async (req, res) => {
  try {
    const {
      project_code,
      project_date,
      lead_code,
      technology,
      estimated_hours,
      remaining_hours,
      weekly_limit_summary,
      tracker_status,
      client_id,
      profile,
      project_title,
      status,
      nda,
      nda_status,
      project_rate,
    } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    let lead = {};
    if (lead_code) {
      lead = await Lead.findOne({ lead_code: lead_code });

      if (!lead || lead.lead_code !== lead_code) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: PROJECT_MESSAGES.LEAD_CODE_NOT_MATCH,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    const projectDate = project_date ? project_date : await getCurrentDate();
    const project = await Project.create({
      project_start_date: projectDate,
      project_code: project_code,
      lead_code: lead_code,
      technology: technology,
      estimated_hours: estimated_hours,
      remaining_hours: remaining_hours,
      weekly_limit_summary: weekly_limit_summary,
      tracker_status: tracker_status,
      client_id: client_id,
      profile: profile,
      project_title: project_title,
      status: status,
      nda: nda,
      nda_status: nda_status,
      project_rate: project_rate,
      created_by: employee_code,
    });
    if (project && lead) {
      await Lead.findByIdAndUpdate(lead._id, {
        project_count: lead.project_count + 1,
      });
    }
    if (project) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_CREATED,
        data: project,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: PROJECT_MESSAGES.PROJECT_NOT_CREATED,
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

/* UPDATE PROJECT // METHOD: PUT // project id in PARAMS */
/* PAYLOAD: project_code,lead_code,technology,estimated_hours,remaining_hours,weekly_limit_summary,tracker_status,client_name,project_title,status,nda,nda_status,project_rate,project_assign */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      project_code,
      lead_code,
      technology,
      estimated_hours,
      remaining_hours,
      weekly_limit_summary,
      tracker_status,
      client_id,
      profile,
      project_title,
      status,
      nda,
      nda_status,
      project_date,
      project_rate,
    } = req.body;

    if (lead_code) {
      const lead = await Lead.findOne({ lead_code: lead_code });

      if (!lead || lead.lead_code !== lead_code) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: PROJECT_MESSAGES.LEAD_CODE_NOT_MATCH,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    const project_start_date = project_date
      ? project_date
      : await getCurrentDate();
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        project_start_date: project_start_date,
        project_code: project_code,
        lead_code: lead_code,
        technology: technology,
        estimated_hours: estimated_hours,
        remaining_hours: remaining_hours,
        weekly_limit_summary: weekly_limit_summary,
        tracker_status: tracker_status,
        client_id: client_id,
        profile: profile,
        project_title: project_title,
        status: status,
        nda: nda,
        nda_status: nda_status,
        project_rate: project_rate,
        updated_by: id,
      },
      { new: true }
    );

    if (updatedProject) {
      await Employee_Project.deleteMany({
        project_code: updatedProject.project_code,
      });

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_UPDATED,
        data: updatedProject,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: PROJECT_MESSAGES.PROJECT_NOT_UPDATED,
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

/* LIST ALL PROJECTS // METHOD: POST // PAYLOAD: filter, search, sort, current_page, per_page */
const listProject = async (req, res) => {
  try {
    const { filter, search, sort, current_page, per_page, project_status } =
      req.body;
    const { date } = filter;

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

    const order_by = sort.order ? sort.order : -1;

    let matchObj = {
      createdAt: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
      is_deleted: false,
    };
    if (project_status !== "") {
      matchObj.status = project_status;
    }

    let client = [];

    client = await Client.find({
      $or: [{ client_name: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (client.length > 0) {
      client = client.map((o) => o._id);
    }

    const totalCount = await Project.countDocuments({
      ...matchObj,
      $or: [
        { client_id: { $in: client } },
        { project_code: { $regex: `^${search_by}`, $options: "i" } },
        { project_title: { $regex: `^${search_by}`, $options: "i" } },
        { profile: { $regex: `^${search_by}`, $options: "i" } },
      ],
    });

    const listProject = await Project.aggregate([
      {
        $match: {
          ...matchObj,
          $or: [
            { client_id: { $in: client } },
            { project_code: { $regex: `^${search_by}`, $options: "i" } },
            { project_title: { $regex: `^${search_by}`, $options: "i" } },
            { profile: { $regex: `^${search_by}`, $options: "i" } },
          ],
        },
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
          from: ADD_HOURS,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$project_code", "$$p_code"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                hours: 1,
              },
            },
          ],
          as: "tracker_status",
        },
      },
      {
        $addFields: {
          tracker_status: {
            $cond: {
              if: { $gte: [{ $size: "$tracker_status" }, 2] },
              then: { $sum: "$tracker_status.hours" },
              else: {
                $cond: {
                  if: { $eq: [{ $size: "$tracker_status" }, 1] },
                  then: { $arrayElemAt: ["$tracker_status.hours", 0] },
                  else: 0,
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$project_code", "$$p_code"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp_code: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$employee_code", "$$emp_code"],
                      },
                    },
                  },
                ],
                as: "project_assign",
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 1,
                project_assign: {
                  $cond: {
                    if: { $gte: [{ $size: "$project_assign" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$project_assign.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$project_assign.lastname", 0] },
                      ],
                    },
                    else: [],
                  },
                },
              },
            },
          ],
          as: "project_assign",
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
        $project: {
          client: 0,
        },
      },
      {
        $sort: { [sort_column]: order_by },
      },
      {
        $project: {
          lead_code: 0,
          client_id: 0,
          project_rate: 0,
          is_deleted: 0,
          updated_by: 0,
          created_by: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ]);

    const total_pages = Math.ceil(totalCount / per_page_f);
    const responsePayload = {
      status:
        // listProject.length > 0
          // ?
           RESPONSE_PAYLOAD_STATUS_SUCCESS,
          // : RESPONSE_PAYLOAD_STATUS_ERROR,
      message:
        listProject.length > 0
          ? PROJECT_MESSAGES.PROJECT_FOUND
          : PROJECT_MESSAGES.PROJECT_NOT_FOUND,
      data: {
        data: listProject,
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

/* LIST ALLEmployee PROJECTS By LEAD ASSIGN // METHOD: POST // PAYLOAD: filter, search, sort, current_page, per_page */
const listEmployeeProjects = async (req, res) => {
  try {
    const { employee_code, group } = req[AUTH_USER_DETAILS];
    const { filter, search, sort, current_page, per_page, project_status } =
      req.body;

    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;

    const date_start = filter
      ? filter.date
        ? filter.date.start
          ? filter.date.start
          : new Date("1947-08-15").getTime()
        : new Date("1947-08-15").getTime()
      : null;
    const date_end = filter
      ? filter.date
        ? filter.date.end
          ? filter.date.end
          : new Date()
        : new Date()
      : null;

    const search_by = search ? search.replace(/[^0-9a-zA-Z]/g, "\\$&") : "";

    const sort_column = sort
      ? sort.column
        ? sort.column
        : "createdAt"
      : "createdAt";
    const order_by = sort ? (sort.order ? sort.order : -1) : -1;

    let lookupCond = {};
    if (group !== "admin") {
      lookupCond = {
        lead_assign: {
          $elemMatch: { employee_code: employee_code },
        },
      };
    }

    let matchObj = {
      createdAt: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
      is_deleted: false,
    };
    if (project_status !== "") {
      matchObj.status = project_status;
    }

    let client = [];

    client = await Client.find({
      $or: [{ client_name: { $regex: `^${search_by}`, $options: "i" } }],
    }).select({ _id: 1 });

    if (client.length > 0) {
      client = client.map((o) => o._id);
    }

    const totalCount = await Project.countDocuments({
      ...matchObj,
      $or: [
        { client_id: { $in: client } },
        { project_code: { $regex: `^${search_by}`, $options: "i" } },
        { project_title: { $regex: `^${search_by}`, $options: "i" } },
        { profile: { $regex: `^${search_by}`, $options: "i" } },
      ],
    });

    let listProject = await Project.aggregate([
      {
        $match: {
          ...matchObj,
          $or: [
            { client_id: { $in: client } },
            { project_code: { $regex: `^${search_by}`, $options: "i" } },
            { project_title: { $regex: `^${search_by}`, $options: "i" } },
            { profile: { $regex: `^${search_by}`, $options: "i" } },
          ],
        },
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
          from: LEAD,
          let: { l_code: "$lead_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$lead_code", "$$l_code"] },
                    { $eq: ["$is_deleted", false] },
                    { $eq: ["$is_disable", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { e_code: "$lead_assign" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$e_code"] },
                    },
                  },
                ],
                as: "lead_assign",
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: {
                  $cond: {
                    if: { $gte: [{ $size: "$lead_assign" }, 1] },
                    then: { $arrayElemAt: ["$lead_assign.employee_code", 0] },
                    else: "",
                  },
                },
                lead_assign: {
                  $cond: {
                    if: { $gte: [{ $size: "$lead_assign" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$lead_assign.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$lead_assign.lastname", 0] },
                      ],
                    },
                    else: "",
                  },
                },
              },
            },
          ],
          as: "lead_assign",
        },
      },
      {
        $match: lookupCond,
      },
      {
        $lookup: {
          from: ADD_HOURS,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$project_code", "$$p_code"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                hours: 1,
              },
            },
          ],
          as: "tracker_status",
        },
      },
      {
        $addFields: {
          tracker_status: {
            $cond: {
              if: { $gte: [{ $size: "$tracker_status" }, 2] },
              then: { $sum: "$tracker_status.hours" },
              else: {
                $cond: {
                  if: { $eq: [{ $size: "$tracker_status" }, 1] },
                  then: { $arrayElemAt: ["$tracker_status.hours", 0] },
                  else: 0,
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$project_code", "$$p_code"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp_code: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$employee_code", "$$emp_code"],
                      },
                    },
                  },
                ],
                as: "project_assign",
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 1,
                project_assign: {
                  $cond: {
                    if: { $gte: [{ $size: "$project_assign" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$project_assign.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$project_assign.lastname", 0] },
                      ],
                    },
                    else: [],
                  },
                },
              },
            },
          ],
          as: "project_assign",
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
        $project: {
          client: 0,
        },
      },
      {
        $sort: { [sort_column]: order_by },
      },
      {
        $project: {
          lead_code: 0,
          client_id: 0,
          nda: 0,
          profile: 0,
          project_rate: 0,
          is_deleted: 0,
          updated_by: 0,
          created_by: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ]);

    const total_pages = Math.ceil(totalCount / per_page_f);
    const responsePayload = {
      status:
        // listProject.length > 0
        // ?
        RESPONSE_PAYLOAD_STATUS_SUCCESS,
      // : RESPONSE_PAYLOAD_STATUS_ERROR,
      message:
        listProject.length > 0
          ? PROJECT_MESSAGES.PROJECT_FOUND
          : PROJECT_MESSAGES.PROJECT_NOT_FOUND,
      data: {
        data: listProject,
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

/* LIST PROJECT Details BY PROJECT_ID IN PARAMS // METHOD: GET */
const listProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = new mongoose.Types.ObjectId(id);
    // const _id = new ObjectId(id);
    const listProject = await Project.aggregate([
      {
        $match: { _id },
      },
      {
        $lookup: {
          from: EMPLOYEE_PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$project_code", "$$p_code"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp_code: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$employee_code", "$$emp_code"],
                      },
                    },
                  },
                ],
                as: "project_assign",
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 1,
                project_assign: {
                  $cond: {
                    if: { $gte: [{ $size: "$project_assign" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$project_assign.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$project_assign.lastname", 0] },
                      ],
                    },
                    else: [],
                  },
                },
              },
            },
          ],
          as: "project_assign",
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
          client: 0,
        },
      },
    ]);
    if (listProject) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_FOUND,
        data: listProject[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_NOT_FOUND,
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

/* LIST PROJECT Details BY PROJECT_ID IN PARAMS // METHOD: GET */
const listEmployeeByProjectCode = async (req, res) => {
  try {
    const { project_code } = req.params;
    const listProject = await Project.aggregate([
      {
        $match: { project_code },
      },
      {
        $lookup: {
          from: EMPLOYEE_PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$project_code", "$$p_code"] }],
                },
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { emp_code: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$employee_code", "$$emp_code"],
                      },
                      is_deleted: false,
                    },
                  },
                ],
                as: "project_assign",
              },
            },
            {
              $project: {
                _id: 0,
                employee_code: 1,
                employee_name: {
                  $cond: {
                    if: { $gte: [{ $size: "$project_assign" }, 1] },
                    then: {
                      $concat: [
                        { $arrayElemAt: ["$project_assign.firstname", 0] },
                        " ",
                        { $arrayElemAt: ["$project_assign.lastname", 0] },
                      ],
                    },
                    else: "",
                  },
                },
              },
            },
          ],
          as: "employee_name",
        },
      },
      // {
      //   $addfield: {
      //     employeea_name: {
      //       $filter: {
      //         input: "$employee_name",
      //         as: "name",
      //         cond: {
      //           $ne: ["$$name.employee_name", ""]
      //         }
      //       }
      //     }
      //   }
      // },
      {
        $project: {
          _id: 0,
          employee_name: {
            $filter: {
              input: "$employee_name",
              as: "name",
              cond: {
                $ne: ["$$name.employee_name", ""],
              },
            },
          },
        },
      },
    ]);
    if (listProject) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_FOUND,
        data: listProject[0].employee_name,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_NOT_FOUND,
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

/* LIST ALL PROJECT CODE // METHOD: GET */
const listProjectCode = async (req, res) => {
  try {
    const projectCode = await Project.find({}).populate("client_id");
    const projectCodeList = projectCode.map((project) => {
      return {
        project_code: project.project_code,
        project_title: project.project_title,
        client_name: project.client_id?.client_name || "---",
      };
    });
    if (projectCodeList.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_CODE_FOUND,
        data: projectCodeList,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_CODE_NOT_FOUND,
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

/* add additional hours for estimated hours // METHOD: POST // PARAMS: project_code */
const addEstimatedHours = async (req, res) => {
  try {
    const { project_code } = req.params;
    const { hours } = req.body;

    if (project_code) {
      const project = await Project.findOne({ project_code: project_code });

      if (!project) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: PROJECT_MESSAGES.PROJECT_CODE_NOT_MATCH,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    const addEstimatedHours = await Project.findOneAndUpdate(
      { project_code },
      { $inc: { estimated_hours: hours } }
    );

    if (addEstimatedHours) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.HOURS_ADDED_IN_ESTIMATED_HOURS,
        data: addEstimatedHours,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: PROJECT_MESSAGES.HOURS_NOT_ADDED_IN_ESTIMATED_HOURS,
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

/* LIST ALL PROJECT CODE // METHOD: GET */
const getListProject = async (req, res) => {
  try {
    const listProject = await Project.aggregate([
      {
        $match: { is_deleted: false },
      },
      {
        $lookup: {
          from: EMPLOYEE_PROJECT,
          localField: "project_code",
          foreignField: "project_code",
          as: "employeeProjects",
        },
      },
      {
        $unwind: {
          path: "$employeeProjects",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { emp_code: "$employeeProjects.employee_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$employee_code", "$$emp_code"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                firstname: 1,
                lastname: 1,
              },
            },
          ],
          as: "project_assign",
        },
      },
      {
        $group: {
          _id: "$_id",
          project_start_date: { $first: "$project_start_date" },
          project_code: { $first: "$project_code" },
          lead_code: { $first: "$lead_code" },
          technology: { $first: "$technology" },
          estimated_hours: { $first: "$estimated_hours" },
          remaining_hours: { $first: "$remaining_hours" },
          weekly_limit_summary: { $first: "$weekly_limit_summary" },
          tracker_status: { $first: "$tracker_status" },
          client_id: { $first: "$client_id" },
          profile: { $first: "$profile" },
          project_title: { $first: "$project_title" },
          status: { $first: "$status" },
          nda: { $first: "$nda" },
          nda_status: { $first: "$nda_status" },
          project_rate: { $first: "$project_rate" },
          is_deleted: { $first: "$is_deleted" },
          updated_by: { $first: "$updated_by" },
          created_by: { $first: "$created_by" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          project_assign: { $first: "$project_assign" },
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
          project_assign: {
            $cond: {
              if: { $gte: [{ $size: "$project_assign" }, 1] },
              then: {
                $concat: [
                  { $arrayElemAt: ["$project_assign.firstname", 0] },
                  " ",
                  { $arrayElemAt: ["$project_assign.lastname", 0] },
                ],
              },
              else: "---",
            },
          },
        },
      },
      {
        $project: {
          project_start_date: 1,
          project_code: 1,
          lead_code: 1,
          technology: 1,
          estimated_hours: 1,
          remaining_hours: 1,
          weekly_limit_summary: 1,
          tracker_status: 1,
          client_name: 1,
          profile: 1,
          project_title: 1,
          status: 1,
          nda: 1,
          nda_status: 1,
          project_rate: 1,
          is_deleted: 1,
          updated_by: 1,
          created_by: 1,
          createdAt: 1,
          updatedAt: 1,
          project_assign: 1,
        },
      },
    ]);
    if (listProject) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_FOUND,
        data: listProject,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: PROJECT_MESSAGES.PROJECT_NOT_FOUND,
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
  addProject,
  updateProject,
  listProject,
  listProjectById,
  listProjectCode,
  addEstimatedHours,
  getListProject,
  listEmployeeProjects,
  listEmployeeByProjectCode,
};
