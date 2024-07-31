const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  EMPLOYEE,
  TECHNOLOGY,
  LEAD,
  PROJECT,
  BIDS,
} = require("../../constants/models.enum.constants");
const {
  DASHBOARD_MESSAGES,
} = require("../../controller-messages/dashboard-messages/dashboard.messages");
const { Bids } = require("../../models/bids/bids.model");
const { Lead } = require("../../models/lead/lead.model");
const { Project } = require("../../models/project/project.model");
const Technology = require("../../models/technology/technology.model");
const { ObjectId } = require("mongodb");

/* LIST WORK REPORT FOR BIDS, LEADS, PROJECTS // METHOD: POST // PAYLOAD: filter */
const workReport = async (req, res) => {
  try {
    const d = new Date();
    const filter = req.body.filter;

    // let start_date = new Date(d.setHours(d.getHours() - d.getHours()));
    // let end_date = new Date(d.setDate(d.getDate() + 1));

    let start_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 30, 0, 0);
    let end_date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 5, 29, 0, 0);

    if (filter && filter.date) {
      const { start, end } = filter.date;
      if (start) {
        start_date = new Date(start);
      }
      if (end) {
        end_date = new Date(end);
      }
    }

    // const date_start = date
    //   ? date.start
    //     ? date.start
    //     : new Date().getTime()
    //   : new Date().getTime();
    // const date_end = date ? (date.end ? date.end : new Date()) : new Date();

    const bids = await Bids.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
        },
      },
      { $count: "count" },
    ]);

    const lead = await Lead.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
        },
      },
      { $count: "count" },
    ]);

    const project = await Project.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
        },
      },
      { $count: "count" },
    ]);

    const bidsCount = bids.length > 0 ? bids[0].count : 0;
    const leadCount = lead.length > 0 ? lead[0].count : 0;
    const projectCount = project.length > 0 ? project[0].count : 0;

    if (bidsCount || leadCount || projectCount) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.WORK_REPORT_RETRIEVED,
        data: { bids: bidsCount, lead: leadCount, project: projectCount },
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.WORK_REPORT_NOT_FOUND,
        data: null,
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

/* LIST EMPLOYEE WORK REPORT FOR BIDS, LEADS, PROJECTS // METHOD: POST // PAYLOAD: filter */
const employeeWorkReport = async (req, res) => {
  try {
    const d = new Date();
    const filter = req.body.filter;

    // let start_date = new Date(d.setHours(d.getHours() - d.getHours()));
    // let end_date = new Date(d.setDate(d.getDate() + 1));

    let start_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 30, 0, 0);
    let end_date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 5, 29, 0, 0);

    if (filter && filter.date) {
      const { start, end } = filter.date;
      if (start) {
        start_date = new Date(start);
      }
      if (end) {
        end_date = new Date(end);
      }
    }

    const bidCounts = await Bids.aggregate([
      {
        $match: {
          is_deleted: false,
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          localField: 'bidder_name',
          foreignField: 'employee_code',
          as: 'employeeInfo',
        },
      },
      {
        $project: {
          _id: 1,
          bidder_name: { $arrayElemAt: ['$employeeInfo.firstname', 0] },
        },
      },
      {
        $group: {
          _id: '$bidder_name',
          bids: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          bids: 1
        }
      }
    ]);

    const leadCounts = await Lead.aggregate([
      {
        $match: {
          is_deleted: false,
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        }
      },
      {
        $addFields: {
          lead_code_string: { $toString: "$lead_code" }
        }
      },
      {
        $lookup: {
          from: BIDS,
          let: { bidCode: "$lead_code_string" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$bids_code", "$$bidCode"] },
              },
            },
            {
              $project: {
                _id: 0,
                bidder_name: 1
              }
            }
          ],
          as: "bid_data"
        }
      },
      {
        $unwind: "$bid_data"
      },
      {
        $addFields: {
          bidder_name: "$bid_data.bidder_name"
        }
      },
      {
        $lookup: {
          from: EMPLOYEE,
          localField: 'bidder_name',
          foreignField: 'employee_code',
          as: 'employeeInfo',
        },
      },
      {
        $project: {
          _id: 1,
          bidder_name: { $arrayElemAt: ['$employeeInfo.firstname', 0] },
        },
      },
      {
        $group: {
          _id: '$bidder_name',
          leads: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          leads: 1
        }
      }
    ])

    const projectCounts = await Project.aggregate([
      {
        $match: {
          is_deleted: false,
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        }
      },
      {
        $addFields: {
          lead_code_string: { $toString: "$lead_code" }
        }
      },
      {
        $lookup: {
          from: BIDS,
          let: { bidCode: "$lead_code_string" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$bids_code", "$$bidCode"] },
              },
            },
            {
              $project: {
                _id: 0,
                bidder_name: 1
              }
            }
          ],
          as: "bid_data"
        }
      },
      {
        $unwind: "$bid_data"
      },
      {
        $addFields: {
          bidder_name: "$bid_data.bidder_name"
        }
      },
      {
        $lookup: {
          from: EMPLOYEE,
          localField: 'bidder_name',
          foreignField: 'employee_code',
          as: 'employeeInfo',
        },
      },
      {
        $project: {
          _id: 1,
          bidder_name: { $arrayElemAt: ['$employeeInfo.firstname', 0] },
        },
      },
      {
        $group: {
          _id: '$bidder_name',
          projects: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          projects: 1
        }
      }
    ])
    const combinedData = {};

    function combineCounts(dataArray, keyName) {
      dataArray.forEach(item => {
        const { name, ...counts } = item;
        if (!combinedData[name]) {
          combinedData[name] = { name, bids: 0, leads: 0, projects: 0 };
        }
        combinedData[name][keyName] = counts[keyName];
      });
    }

    combineCounts(bidCounts, 'bids');
    combineCounts(leadCounts, 'leads');
    combineCounts(projectCounts, 'projects');

    const finalResult = Object.values(combinedData);

    output = { data: finalResult }

    if (output) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.EMPLOYEE_WORK_REPORT_RETRIEVED,
        data: output,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.EMPLOYEE_WORK_REPORT_NOT_FOUND,
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

/* LIST TECHNOLOGY WORK REPORT FOR BIDS, LEADS, PROJECTS // METHOD: POST // PAYLOAD: filter */
const technologyWorkReport = async (req, res) => {
  try {
    const d = new Date();
    const filter = req.body.filter;

    // let start_date = new Date(d.setHours(d.getHours() - d.getHours()));
    // let end_date = new Date(d.setDate(d.getDate() + 1));

    let start_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 30, 0, 0);
    let end_date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 5, 29, 0, 0);

    if (filter && filter.date) {
      const { start, end } = filter.date;
      if (start) {
        start_date = new Date(start);
      }
      if (end) {
        end_date = new Date(end);
      }
    }

    const bidCounts = await Bids.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
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
    ]);

    const leadCounts = await Lead.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
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
    ]);

    const projectCounts = await Project.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
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
    ]);

    const employeeCounts = {};

    bidCounts.forEach((bid) => {
      const { technology } = bid;
      technology.forEach((tech) => {
        if (employeeCounts[tech]) {
          employeeCounts[tech].bids = (employeeCounts[tech].bids || 0) + 1;
        } else {
          employeeCounts[tech] = {
            bids: 1,
            leads: 0,
            projects: 0,
          };
        }
      });
    });

    leadCounts.forEach((lead) => {
      const { technology } = lead;
      technology.forEach((tech) => {
        if (employeeCounts[tech]) {
          employeeCounts[tech].leads = (employeeCounts[tech].leads || 0) + 1;
        } else {
          employeeCounts[tech] = {
            bids: 0,
            leads: 1,
            projects: 0,
          };
        }
      });
    });

    projectCounts.forEach((project) => {
      const { technology } = project;
      technology.forEach((tech) => {
        if (employeeCounts[tech]) {
          employeeCounts[tech].projects =
            (employeeCounts[tech].projects || 0) + 1;
        } else {
          employeeCounts[tech] = {
            bids: 0,
            leads: 0,
            projects: 1,
          };
        }
      });
    });

    const formattedEmployeeCounts = [];

    for (const key in employeeCounts) {
      const employeeCount = {
        name: key,
        bids: employeeCounts[key].bids || 0,
        leads: employeeCounts[key].leads || 0,
        projects: employeeCounts[key].projects || 0,
      };
      formattedEmployeeCounts.push(employeeCount);
    }

    const output = {
      data: formattedEmployeeCounts,
    };

    if (output) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.TECHNOLOGY_WORK_REPORT_RETRIEVED,
        data: output,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: DASHBOARD_MESSAGES.TECHNOLOGY_WORK_REPORT_NOT_FOUND,
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

/* LIST WORK REPORT FOR BIDS, LEADS, PROJECTS // METHOD: GET */
const workReportdwm = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentDateTime = currentDate.getTime();
    const { employee_code } = req[AUTH_USER_DETAILS];

    const getBidsCount = async (matchCriteria) => {
      const bids = await Bids.aggregate([
        {
          $match: {
            createdAt: matchCriteria,
            is_deleted: false,
            created_by: employee_code,
          },
        },
        { $count: "count" },
      ]);

      return bids.length > 0 ? bids[0].count : 0;
    };

    const getLeadCount = async (matchCriteria) => {
      const leads = await Lead.aggregate([
        {
          $match: {
            createdAt: matchCriteria,
            is_deleted: false,
            created_by: employee_code,
          },
        },
        { $count: "count" },
      ]);

      return leads.length > 0 ? leads[0].count : 0;
    };

    const getProjectCount = async (matchCriteria) => {
      const projects = await Project.aggregate([
        {
          $match: {
            createdAt: matchCriteria,
            is_deleted: false,
            created_by: employee_code,
          },
        },
        { $count: "count" },
      ]);

      return projects.length > 0 ? projects[0].count : 0;
    };

    const getMatchCriteria = (start, end, isMonth = false) => {
      const matchCriteria = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          start
        ),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          end + 1
        ),
      };

      if (isMonth) {
        matchCriteria.$gte = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          start
        );
        matchCriteria.$lt = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          end + 1
        );
      }

      return matchCriteria;
    };

    const startOfDay = currentDate.getDate();
    const endOfDay = currentDate.getDate() + 1;

    const startOfWeek = currentDate.getDate() - (currentDate.getDay() || 7) + 1;
    const endOfWeek = currentDate.getDate() - (currentDate.getDay() || 7) + 7;

    const startOfMonth = 1;
    const endOfMonth = currentDate.getDate();

    const bidsDailyCount = await getBidsCount(
      getMatchCriteria(startOfDay, endOfDay)
    );
    const leadDailyCount = await getLeadCount(
      getMatchCriteria(startOfDay, endOfDay)
    );
    const projectDailyCount = await getProjectCount(
      getMatchCriteria(startOfDay, endOfDay)
    );

    const bidsWeeklyCount = await getBidsCount(
      getMatchCriteria(startOfWeek, endOfWeek)
    );
    const leadWeeklyCount = await getLeadCount(
      getMatchCriteria(startOfWeek, endOfWeek)
    );
    const projectWeeklyCount = await getProjectCount(
      getMatchCriteria(startOfWeek, endOfWeek)
    );

    const bidsMonthlyCount = await getBidsCount(
      getMatchCriteria(startOfMonth, endOfMonth, true)
    );
    const leadMonthlyCount = await getLeadCount(
      getMatchCriteria(startOfMonth, endOfMonth, true)
    );
    const projectMonthlyCount = await getProjectCount(
      getMatchCriteria(startOfMonth, endOfMonth, true)
    );

    result = {
      daily: {
        bids: bidsDailyCount,
        lead: leadDailyCount,
        project: projectDailyCount,
      },
      weekly: {
        bids: bidsWeeklyCount,
        lead: leadWeeklyCount,
        project: projectWeeklyCount,
      },
      monthly: {
        bids: bidsMonthlyCount,
        lead: leadMonthlyCount,
        project: projectMonthlyCount,
      },
    };

    if (bidsDailyCount || bidsWeeklyCount || bidsMonthlyCount) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.WORK_REPORT_RETRIEVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: DASHBOARD_MESSAGES.WORK_REPORT_NOT_FOUND,
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
  workReport,
  employeeWorkReport,
  technologyWorkReport,
  workReportdwm,
};
