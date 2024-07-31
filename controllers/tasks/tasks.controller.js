const moment = require("moment");
const momentTimezone = require("moment-timezone");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");

const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  TASK_COMMENTS,
  EMPLOYEE,
  PROJECT,
  LEAD,
  CLIENT,
} = require("../../constants/models.enum.constants");
const {
  TASK_MESSAGE,
} = require("../../controller-messages/tasks-messages/tasks.messages");
const { Tasks } = require("../../models/tasks/tasks.model");
const { ENUMS } = require("../../constants/enum.constants");
const Employee = require("../../models/employee/employee.model");
const { ObjectId } = require("mongodb");
const XLSX = require("xlsx");
const {
  checkColumn,
  convertMinutes,
  formatNumberToFixed,
  formatDate,
  getWorkingDaysWithLastSaturday,
} = require("../../helpers/fn");
const { Project } = require("../../models/project/project.model");
const {
  changeTaskStatusMailer,
} = require("../../services/mailer/changeTaskStatusMailTemplate");
const { Cron_Job_Logs } = require("../../models/logs/cronjob.logs.model");
const {
  Employee_Project,
} = require("../../models/project/employee.project.model");
const { dateAndTimeFormat } = require("../../helpers/date-formatter");
const { default: mongoose } = require("mongoose");
const Team_managment = require("../../models/team_managment/team.managment.model");
const {
  TEAM_MESSAGE,
} = require("../../controller-messages/teammanagment-messages/team.managment.messages");
const { Task_Comments } = require("../../models/tasks/task.comments.model");
const Leave = require("../../models/leave/leave.model");
const Holiday = require("../../models/holiday/holiday.model");
const Working_date = require("../../models/working_date/working_date.model");

/* LIST ALL TASKS of Employee by employee_code // METHOD: POST // PAYLOAD: employee_code, project_code */
const listAllTasks = async (req, res) => {
  try {
    const {
      filter,
      task_status,
      employee_code,
      search,
      sort,
      current_page,
      per_page,
      with_tracker,
    } = req.body;

    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;

    const sort_column = sort
      ? sort.column
        ? sort.column
        : "project_code"
      : "project_code";

    const order_by = sort.order ? sort.order : -1;

    const search_by = search ? search.replace(/[^a-zA-Z0-9 ]/g, "") : "";

    const d = new Date();

    const date_start = filter
      ? filter.date
        ? filter.date.start
          ? filter.date.start
          : new Date(d.setHours(d.getHours() - d.getHours()))
        : new Date(d.setHours(d.getHours() - d.getHours()))
      : null;
    const date_end = filter
      ? filter.date
        ? filter.date.end
          ? filter.date.end
          : new Date(d.setDate(d.getDate() + 1))
        : new Date(d.setDate(d.getDate() + 1))
      : null;

    const { teamMembers } = req[AUTH_USER_DETAILS];

    let matchObj = {
      $or: [
        {
          task_date: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
        {
          assigned_on: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
      ],
      employee_code: { $in: teamMembers },
      is_deleted: false,
      is_disabled: false,
    };

    if (task_status) {
      matchObj = {
        ...matchObj,
        status: task_status,
      };
    }

    if (employee_code) {
      matchObj = {
        ...matchObj,
        employee_code: employee_code,
      };
    }
    if (with_tracker) {
      matchObj = {
        ...matchObj,
        with_tracker: { $in: with_tracker },
      };
    }

    if (search_by) {
      matchObj = {
        ...matchObj,
        $or: [
          {
            title: { $regex: search_by, $options: "i" },
          },
          {
            project_code: { $regex: search_by, $options: "i" },
          },
          {
            employee_code: { $regex: search_by, $options: "i" },
          },
          {
            status: { $regex: search_by, $options: "i" },
          },
        ],
      };
    }

    let result = await Tasks.aggregate([
      {
        $match: matchObj,
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
                email: 1,
                profile_pic: {
                  $ifNull: ["$profile_pic", "-"],
                },
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
        $lookup: {
          from: PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_code", "$$p_code"] },
                is_deleted: false,
              },
            },
            {
              $lookup: {
                from: CLIENT,
                let: { c_id: "$client_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$c_id"] },
                      is_deleted: false,
                    },
                  },
                ],
                as: "clients",
              },
            },
            {
              $lookup: {
                from: LEAD,
                let: { l_code: "$lead_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$lead_code", "$$l_code"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      lead_code: 1,
                    },
                  },
                ],
                as: "lead",
              },
            },
            {
              $project: {
                _id: 0,
                project_title: 1,
                clients: 1,
                lead: 1,
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $unwind: "$projects",
      },
      {
        $addFields: {
          project_title: "$projects.project_title",
          lead_data: { $arrayElemAt: ["$projects.lead", 0] },
        },
      },
      {
        $unwind: "$projects.clients",
      },
      {
        $addFields: {
          client_name: "$projects.clients.client_name",
        },
      },
      {
        $unset: "projects",
      },
      {
        $lookup: {
          from: TASK_COMMENTS,
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$task_id", "$$id"] },
                is_deleted: false,
                is_disabled: false,
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { e_code: "$commented_by" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$employee_code", "$$e_code"] },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: { $concat: ["$firstname", "-", "$lastname"] },
                      employee_code: 1,
                    },
                  },
                ],
                as: "commented_by",
              },
            },
            {
              $addFields: {
                commented_by: {
                  $cond: {
                    if: { $gt: [{ $size: "$commented_by" }, 0] },
                    then: { $arrayElemAt: ["$commented_by", 0] },
                    else: "---",
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                commented_by: {
                  $ifNull: ["$commented_by.employee_code", "---"],
                },
                name: { $ifNull: ["$commented_by.name", "---"] },
                created_date: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $sort: { lead_code: 1, with_tracker: -1 },
      },
      {
        $project: {
          is_deleted: 0,
          is_disabled: 0,
          updated_by: 0,
          deleted_by: 0,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (current_page_f - 1) * per_page_f },
            { $limit: per_page_f },
            { $sort: { [sort_column]: order_by } },
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
    if (result[0].data && result[0].data.length) {
      result[0].data = result[0].data.map((task) => {
        task.due_date = dateAndTimeFormat(task.due_date, "Asia/Kolkata");
        task.assigned_on = dateAndTimeFormat(task.assigned_on, "Asia/Kolkata");
        task.expected_tracker_time = formatNumberToFixed(
          task.expected_tracker_time
        );
        task.real_tracker_time = formatNumberToFixed(task.real_tracker_time);
        task.time_difference =
          task.expected_tracker_time - task.real_tracker_time;
        return task;
      });

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_NOT_FOUND,
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

/* LIST ALL TASKS details of Employee// METHOD: POST // PAYLOAD: employee_code, project_code */
const allEmployeeTaskInfotracker = async (req, res) => {
  try {
    // const filter = req.body.filter;
    const { filter, task_status, employee_code, search } = req.body;

    const { teamMembers } = req[AUTH_USER_DETAILS];

    const d = new Date();

    const search_by = search ? search.replace(/[^a-zA-Z0-9 ]/g, "") : "";

    const date_start = filter
      ? filter.date
        ? filter.date.start
          ? filter.date.start
          : new Date(d.setHours(d.getHours() - d.getHours()))
        : new Date(d.setHours(d.getHours() - d.getHours()))
      : null;
    const date_end = filter
      ? filter.date
        ? filter.date.end
          ? filter.date.end
          : new Date(d.setDate(d.getDate() + 1))
        : new Date(d.setDate(d.getDate() + 1))
      : null;

    let matchObj = {
      $or: [
        {
          task_date: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
        {
          assigned_on: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
        },
      ],
      employee_code: { $in: teamMembers },
      is_deleted: false,
      is_disabled: false,
    };

    if (task_status) {
      matchObj = {
        ...matchObj,
        status: task_status,
      };
    }

    if (employee_code) {
      matchObj = {
        ...matchObj,
        employee_code: employee_code,
      };
    }

    if (search_by) {
      matchObj = {
        ...matchObj,
        $or: [
          {
            title: { $regex: search_by, $options: "i" },
          },
          {
            project_code: { $regex: search_by, $options: "i" },
          },
          {
            employee_code: { $regex: search_by, $options: "i" },
          },
          {
            status: { $regex: search_by, $options: "i" },
          },
        ],
      };
    }

    let matchObj1 = {
      is_deleted: false,
      employee_code: { $in: teamMembers },
    };

    if (employee_code) {
      matchObj1 = {
        ...matchObj1,
        employee_code: employee_code,
      };
    }

    let result = await Tasks.aggregate([
      {
        $match: matchObj,
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
                employee_code: 1,
                fullname: { $concat: ["$firstname", " ", "$lastname"] },
                email: 1,
                profile_pic: {
                  $ifNull: ["$profile_pic", "-"],
                },
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
        $lookup: {
          from: PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_code", "$$p_code"] },
                is_deleted: false,
              },
            },

            {
              $project: {
                _id: 0,
                project_title: 1,
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $unwind: "$projects",
      },
      {
        $addFields: {
          project_title: "$projects.project_title",
        },
      },
      {
        $unset: "projects",
      },
      {
        $project: {
          is_deleted: 0,
          is_disabled: 0,
          updated_by: 0,
          deleted_by: 0,
        },
      },
    ]);

    let allEmployee = await Employee.aggregate([
      {
        $match: matchObj1,
      },
      {
        $project: {
          _id: 1,
          employee_code: 1,
          name: { $concat: ["$firstname", " ", "$lastname"] },
        },
      },
    ]);

    const employeesWithTask = [];
    const employeesWithoutTask = [];

    allEmployee.forEach((employee) => {
      const employeeCode = employee.employee_code;

      const matchingTask = result.find(
        (task) => task.employee_details.employee_code === employeeCode
      );

      if (matchingTask) {
        employeesWithTask.push(employee);
      } else {
        employeesWithoutTask.push(employee);
      }
    });

    const withTracker = [];
    const withoutTracker = [];

    for (const item of result) {
      if (item.with_tracker) {
        withTracker.push(item);
      } else {
        withoutTracker.push(item);
      }
    }

    function calculateSum(dataArray) {
      let sumExpected = 0;
      let sumReal = 0;

      dataArray.forEach((item) => {
        sumExpected += parseFloat(item.expected_tracker_time);
        sumReal += parseFloat(item.real_tracker_time);
      });

      sumExpected = sumExpected.toFixed(2);
      sumReal = sumReal.toFixed(2);

      return { sumExpected, sumReal };
    }

    const withTrackerSum = calculateSum(withTracker);
    const withoutTrackerSum = calculateSum(withoutTracker);

    const withTrackerDifference =
      withTrackerSum.sumExpected - withTrackerSum.sumReal;
    // convertMinutes(withTrackerSum.sumExpected) -
    // convertMinutes(withTrackerSum.sumReal);
    const withoutTrackerDifference =
      withoutTrackerSum.sumExpected - withoutTrackerSum.sumReal;
    // convertMinutes(withoutTrackerSum.sumExpected) -
    // convertMinutes(withoutTrackerSum.sumReal);

    const output = {
      expected_hour_with_tracker: withTrackerSum.sumExpected,
      expected_hour_without_tracker: withoutTrackerSum.sumExpected,
      covered_hour_with_tracker: withTrackerSum.sumReal,
      covered_hour_without_tracker: withoutTrackerSum.sumReal,
      // expected_hour_with_tracker: convertMinutes(withTrackerSum.sumExpected),
      // expected_hour_without_tracker: convertMinutes(
      //   withoutTrackerSum.sumExpected
      // ),
      // covered_hour_with_tracker: convertMinutes(withTrackerSum.sumReal),
      // covered_hour_without_tracker: convertMinutes(withoutTrackerSum.sumReal),
      with_tracker_diffrence: withTrackerDifference.toFixed(2),
      without_tracker_diffrence: withoutTrackerDifference.toFixed(2),
      employee_with_task: employeesWithTask,
      employee_without_task: employeesWithoutTask,
    };

    if (output) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_FOUND,
        data: output,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_NOT_FOUND,
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

/* LIST ALL TASKS of Employee by employee_code // METHOD: POST // PAYLOAD: employee_code, project_code */
const listTasks = async (req, res) => {
  try {
    const { employee_code, project_code, task_status, filter } = req.body;
    const d = new Date();

    const date_start = filter
      ? filter.date
        ? filter.date.start
          ? filter.date.start
          : new Date(d.setHours(d.getHours() - d.getHours()))
        : new Date(d.setHours(d.getHours() - d.getHours()))
      : null;
    const date_end = filter
      ? filter.date
        ? filter.date.end
          ? filter.date.end
          : new Date(d.setDate(d.getDate() + 1))
        : new Date(d.setDate(d.getDate() + 1))
      : null;

    let whereCond = {
      is_deleted: false,
      is_disabled: false,
      employee_code: employee_code,
      task_date: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
    };
    if (project_code) {
      whereCond = { ...whereCond, project_code: { $in: project_code } };
      // whereCond = { ...whereCond, project_code: project_code };
    }
    if (task_status === ENUMS.TASK_STATUS.TODO) {
      whereCond.status = ENUMS.TASK_STATUS.TODO;
    } else if (task_status === ENUMS.TASK_STATUS.IN_PROGRESS) {
      whereCond.status = ENUMS.TASK_STATUS.IN_PROGRESS;
    } else if (task_status === ENUMS.TASK_STATUS.READY_TO_QA) {
      whereCond.status = ENUMS.TASK_STATUS.READY_TO_QA;
    } else if (task_status === ENUMS.TASK_STATUS.DONE) {
      whereCond.status = ENUMS.TASK_STATUS.DONE;
    }

    let result = await Tasks.aggregate([
      {
        $match: whereCond,
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
                email: 1,
                profile_pic: {
                  $ifNull: ["$profile_pic", "-"],
                },
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
        $lookup: {
          from: PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_code", "$$p_code"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                project_title: 1,
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $unwind: "$projects",
      },
      {
        $addFields: {
          project_title: "$projects.project_title",
        },
      },
      {
        $unset: "projects",
      },
      {
        $lookup: {
          from: TASK_COMMENTS,
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$task_id", "$$id"] },
                is_deleted: false,
                is_disabled: false,
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                commented_by: 1,
                name: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $project: {
          is_deleted: 0,
          is_disabled: 0,
          updated_by: 0,
          deleted_by: 0,
        },
      },
      {
        $sort: { assigned_on: 1 },
      },
    ]);
    result = result.map((task) => {
      task.due_date = dateAndTimeFormat(task.due_date, "Asia/Kolkata");

      task.assigned_on = dateAndTimeFormat(task.assigned_on, "Asia/Kolkata");

      return task;
    });

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_NOT_FOUND,
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

/* LIST TASKS Hours by employee_code// METHOD: GET*/
const listTaskHour = async (req, res) => {
  try {
    // const filter = req.body.filter;
    const d = new Date();
    const { employee_code } = req.body;

    let start_date = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      5,
      30,
      0,
      0
    );
    let end_date = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + 1,
      5,
      29,
      0,
      0
    );

    const document = await Tasks.aggregate([
      {
        $match: {
          employee_code: employee_code,
          task_date: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
        },
      },
      // {
      //   $group: {
      //     _id: null,
      //     totalExpectedTrackerTime: {
      //       $sum: { $toDouble: "$expected_tracker_time" },
      //     },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     totalExpectedTrackerTime: {
      //       $round: ["$totalExpectedTrackerTime", 2],
      //     },
      //   },
      // },
    ]);

    const totalHoursCovered = document.reduce((acc, obj) => {
      if (
        [ENUMS.TASK_STATUS.TODO, ENUMS.TASK_STATUS.IN_PROGRESS].includes(
          obj.status
        )
      ) {
        return parseFloat(acc) + parseFloat(obj.expected_tracker_time);
      } else {
        return parseFloat(acc) + parseFloat(obj.real_tracker_time);
      }
    }, 0);
    let remainingTrackerTime = (8.5 - totalHoursCovered).toFixed(2);

    if (totalHoursCovered > 8.5) {
      remainingTrackerTime = "0.00";
    }

    if (document) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.REMAINING_TASK_HOUR_FOUND,
        data: remainingTrackerTime,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.REMAINING_TASK_HOUR_NOT_FOUND,
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

/* LIST TASKS By Id in PARAMS // METHOD: GET // PARAMS: task_id */
const listTasksById = async (req, res) => {
  try {
    const { id } = req.params;
    const match_id = new mongoose.Types.ObjectId(id);
    // const match_id = new ObjectId(id);
    let result = await Tasks.aggregate([
      {
        $match: {
          is_deleted: false,
          is_disabled: false,
          _id: match_id,
        },
      },
      {
        $unwind: {
          path: "$status_history",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { e_code: "$status_history.updated_by" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$e_code"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                updated_by: { $concat: ["$firstname", " ", "$lastname"] },
              },
            },
          ],
          as: "status_history.updated_by",
        },
      },
      {
        $unwind: {
          path: "$status_history.updated_by",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          "status_history.updated_by": "$status_history.updated_by.updated_by",
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          real_tracker_time: { $first: "$real_tracker_time" },
          expected_tracker_time: { $first: "$expected_tracker_time" },
          project_code: { $first: "$project_code" },
          employee_code: { $first: "$employee_code" },
          description: { $first: "$description" },
          status: { $first: "$status" },
          client_time: { $first: "$client_time" },
          with_tracker: { $first: "$with_tracker" },
          due_date: { $first: "$due_date" },
          assigned_on: { $first: "$assigned_on" },
          created_by: { $first: "$created_by" },
          created_date: { $first: "$created_date" },
          status_history: {
            $push: "$status_history",
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
                email: 1,
                profile_pic: {
                  $ifNull: ["$profile_pic", "-"],
                },
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
        $lookup: {
          from: PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_code", "$$p_code"] },
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                project_title: 1,
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $unwind: "$projects",
      },
      {
        $addFields: {
          project_title: "$projects.project_title",
        },
      },
      {
        $unset: "projects",
      },
      {
        $lookup: {
          from: TASK_COMMENTS,
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$task_id", "$$id"] },
                is_deleted: false,
                is_disabled: false,
              },
            },
            {
              $lookup: {
                from: EMPLOYEE,
                let: { e_code: "$commented_by" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$employee_code", "$$e_code"] },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: { $concat: ["$firstname", "-", "$lastname"] },
                      employee_code: 1,
                    },
                  },
                ],
                as: "commented_by",
              },
            },
            {
              $addFields: {
                commented_by: {
                  $cond: {
                    if: { $gt: [{ $size: "$commented_by" }, 0] },
                    then: { $arrayElemAt: ["$commented_by", 0] },
                    else: "---",
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                commented_by: {
                  $ifNull: ["$commented_by.employee_code", "---"],
                },
                name: { $ifNull: ["$commented_by.name", "---"] },
                created_date: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $project: {
          is_deleted: 0,
          is_disabled: 0,
          updated_by: 0,
          deleted_by: 0,
        },
      },
    ]);

    if (result && result.length > 0) {
      result[0].comments.map((e) => (e.updated_date = e.created_date));

      result[0]["activity"] = [].concat(
        Object.keys(result[0].status_history[0]).length === 0
          ? []
          : result[0].status_history,
        result[0].comments.length ? result[0].comments : []
      );

      delete result[0].status_history, delete result[0].comments;

      if (result[0].activity.length) {
        result[0].activity.sort((a, b) => b.updated_date - a.updated_date);
      }

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_NOT_FOUND,
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

/* ADD NEW TASK // METHOD: POST */
/* PAYLOAD: title, project_code, employee_code, client_time, with_tracker, due_date, assigned_on, description */
const addTask = async (req, res) => {
  try {
    const {
      title,
      description = "",
      project_code,
      task_date,
      employee_code,
      expected_tracker_time,
      real_tracker_time,
      client_time,
      with_tracker,
      due_date,
      assigned_on,
      status,
      newComments,
    } = req.body;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];

    const todayIST = moment().tz("Asia/Kolkata").endOf("day");

    const formattedDueDate = due_date
      ? momentTimezone.tz(new Date(due_date), "Asia/Kolkata").format()
      : todayIST.format();
    const formattedAssignDate = assigned_on
      ? momentTimezone.tz(new Date(assigned_on), "Asia/Kolkata").format()
      : moment().format();

    const lastTask = await Tasks.findOne({ employee_code })
      .sort({ task_date: -1 })
      .limit(1)
      .select({ _id: 0, task_date: 1 });

    const datestart = lastTask?.task_date
      ? lastTask.task_date
      : new Date("2024-01-22T05:29:59.000");
    datestart.setDate(datestart.getDate());
    datestart.setHours(0, 0, 0, 0);

    const dateend = lastTask?.task_date
      ? lastTask.task_date
      : new Date(Date.now());
    dateend.setHours(23, 59, 59, 999);

    const existTask = await Tasks.find({
      employee_code: employee_code,
      task_date: {
        $gte: new Date(datestart),
        $lt: new Date(dateend),
      },
      status: { $in: ["To Do", "In-progress"] },
    });

    if (existTask.length <= 0) {
      let createObj = {
        title: title,
        description: description,
        project_code: project_code,
        employee_code: employee_code,
        client_time: client_time,
        with_tracker: with_tracker,
        task_date: task_date,
        expected_tracker_time: expected_tracker_time,
        due_date: formattedDueDate,
        assigned_on: formattedAssignDate,
        real_tracker_time: real_tracker_time,
        created_by: auth_employee_code,
        created_date: moment().format(),
        status_history: [
          {
            status_from: null,
            status_to: ENUMS.TASK_STATUS.TODO,
            updated_by: auth_employee_code,
            updated_date: moment().format(),
          },
        ],
      };

      if (status) {
        createObj = { ...createObj, status: status };
      }
      var result = await Tasks.create(createObj);
      if (result) {
        result = {
          ...result._doc,
          due_date: dateAndTimeFormat(result._doc.due_date, "Asia/Kolkata"),
          assigned_on: dateAndTimeFormat(
            result._doc.assigned_on,
            "Asia/Kolkata"
          ),
        };
      }
      if (newComments != undefined) {
        const task_id = result._id;

        const cmnt = newComments.map((o) => {
          return {
            ...o,
            task_id: task_id,
          };
        });

        let result1 = await Task_Comments.insertMany(cmnt);
        result = {
          ...result,
          comments: result1,
        };
      }
      if (result) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TASK_MESSAGE.TASK_SAVED,
          data: result,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: TASK_MESSAGE.TASK_NOT_SAVED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.YESTERDAY_TASK_ALREADY_EXIST,
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

/* ADD NEW TASK // METHOD: POST */
/* PAYLOAD: title, project_code, employee_code, client_time, with_tracker, due_date, assigned_on, description */
const checkTaskDate = async (req, res) => {
  try {
    const { employee_code } = req.body;

    const lastTask = await Tasks.findOne({ employee_code })
      .sort({ task_date: -1 })
      .limit(1)
      .select({ _id: 0, task_date: 1 });

    let datestart;
    if (lastTask) {
      datestart = lastTask.task_date;
    } else {
      const joinDate = await Employee.findOne({ employee_code }).select({
        _id: 0,
        date_of_joining: 1,
      });
      datestart = joinDate.date_of_joining;
    }

    datestart.setHours(5, 30, 0, 0);

    const yesterdayend = new Date();
    yesterdayend.setHours(4, 59, 59, 999);

    var workingDaysList = await Working_date.find({
      working_date: {
        $gte: new Date(datestart),
        $lt: new Date(yesterdayend),
      },
      is_deleted: false,
    }).select({ _id: 0, working_date: 1, daily_time: 1 });

    const holidays = await Holiday.aggregate([
      {
        $addFields: {
          new_holiday_date: {
            $dateFromString: {
              dateString: "$holiday_date",
              format: "%d-%m-%Y",
            },
          },
        },
      },
      {
        $match: {
          new_holiday_date: {
            $gte: new Date(datestart),
            $lte: new Date(yesterdayend),
          },
        },
      },
      {
        $group: {
          _id: null,
          dates: { $push: "$new_holiday_date" },
        },
      },
      {
        $project: {
          _id: 0,
          dates: 1,
        },
      },
    ]);

    if (holidays.length > 0) {
      workingDaysList.forEach((workingDay) => {
        const workingDayFormatted = formatDate(workingDay.working_date);

        const holiMatch = holidays[0].dates.find(
          (holiDate) => formatDate(holiDate) === workingDayFormatted
        );
        if (holiMatch) {
          workingDaysList = workingDaysList.filter(
            (day) => day.working_date !== workingDay.working_date
          );
        }
      });
    }

    const empLeave = await Leave.aggregate([
      {
        $match: {
          is_deleted: false,
          employee_code: employee_code,
        },
      },
      {
        $addFields: {
          new_leave_date: {
            $dateFromString: {
              dateString: "$leave_date",
              format: "%d-%m-%Y",
            },
          },
        },
      },
      {
        $match: {
          new_leave_date: {
            $gte: new Date(datestart),
            $lte: new Date(yesterdayend),
          },
        },
      },
      {
        $group: {
          _id: null,
          fullDayLeaveDates: {
            $push: {
              $cond: {
                if: { $eq: ["$leave_category", ENUMS.LEAVE_CATEGORY.FULL] },
                then: "$new_leave_date",
                else: null,
              },
            },
          },
          shortDayLeaveDates: {
            $push: {
              $cond: {
                if: { $eq: ["$leave_category", ENUMS.LEAVE_CATEGORY.SHORT] },
                then: "$new_leave_date",
                else: null,
              },
            },
          },
          prePostLunchLeaveDates: {
            $push: {
              $cond: {
                if: {
                  $in: [
                    "$leave_category",
                    [
                      ENUMS.LEAVE_CATEGORY.PRELUNCH,
                      ENUMS.LEAVE_CATEGORY.POSTLUNCH,
                    ],
                  ],
                },
                then: "$new_leave_date",
                else: null,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          fullDayLeaveDates: {
            $filter: {
              input: "$fullDayLeaveDates",
              as: "date",
              cond: { $ne: ["$$date", null] },
            },
          },
          shortDayLeaveDates: {
            $filter: {
              input: "$shortDayLeaveDates",
              as: "date",
              cond: { $ne: ["$$date", null] },
            },
          },
          prePostLunchLeaveDates: {
            $filter: {
              input: "$prePostLunchLeaveDates",
              as: "date",
              cond: { $ne: ["$$date", null] },
            },
          },
        },
      },
    ]);

    if (empLeave.length > 0) {
      workingDaysList.forEach((workingDay) => {
        const workingDayFormatted = formatDate(workingDay.working_date);

        const fullDayMatch = empLeave[0].fullDayLeaveDates.find(
          (leaveDate) => formatDate(leaveDate) === workingDayFormatted
        );
        if (fullDayMatch) {
          workingDaysList = workingDaysList.filter(
            (day) => day.working_date !== workingDay.working_date
          );
        }

        const shortDayMatch = empLeave[0].shortDayLeaveDates.find(
          (leaveDate) => formatDate(leaveDate) === workingDayFormatted
        );
        if (shortDayMatch) {
          workingDay.daily_time = 6;
        }

        const prePostLunchMatch = empLeave[0].prePostLunchLeaveDates.find(
          (leaveDate) => formatDate(leaveDate) === workingDayFormatted
        );
        if (prePostLunchMatch) {
          workingDay.daily_time = 4;
        }
      });
    }
    const taskDetail = await Tasks.aggregate([
      {
        $match: {
          employee_code: employee_code,
          created_date: {
            $gte: new Date(datestart),
            $lt: new Date(yesterdayend),
          },
          is_deleted: false,
        },
      },
      {
        $addFields: {
          expected_tracker_time_numeric: {
            $cond: {
              if: {
                $regexMatch: {
                  input: "$expected_tracker_time",
                  regex: /^[0-9]+$/,
                },
              },
              then: { $toInt: "$expected_tracker_time" },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%dT00:00:00.000Z",
                date: "$created_date",
              },
            },
            employee_code: "$employee_code",
          },
          total_task_time: { $sum: "$expected_tracker_time_numeric" },
        },
      },
      {
        $project: {
          _id: 0,
          total_task_time: 1,
          date: "$_id.date",
        },
      },
    ]);

    if (taskDetail.length > 0) {
      workingDaysList.forEach((workItem) => {
        const workingDayFormatted = formatDate(workItem.working_date);

        const matchingTask = taskDetail.find(
          (task) => formatDate(task.date) === workingDayFormatted
        );

        if (matchingTask) {
          const remainingTime =
            workItem.daily_time - matchingTask.total_task_time;

          if (remainingTime <= 0) {
            workingDaysList = workingDaysList.filter(
              (item) => item.working_date !== workItem.working_date
            );
          } else {
            workItem.daily_time = remainingTime;
          }
        }
      });
    }

    if (workingDaysList.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.CREATE_TASK_DATE,
        data: workingDaysList,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.CREATE_TASK_TODAY,
        data: [],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      // const responsePayload = {
      //   status: RESPONSE_PAYLOAD_STATUS_ERROR,
      //   message: null,
      //   data: {},
      //   error: TASK_MESSAGE.CREATE_TASK_TODAY,
      // };
      // return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
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

/* ADD NEW TASKs BY EXCEL FILE // METHOD: POST */
/* PAYLOAD: title, project_code, employee_code, client_time, with_tracker, due_date, assigned_on, description */
const addTaskByExcelFile = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];

    if (!req.file) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.EXCEL_FILE_NOT_EXISTS,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }

    var worksheetColumns = [
      "title",
      "description",
      "project_code",
      "employee_code",
      "client_time",
      "with_tracker",
      "due_date",
      "assigned_on",
    ];

    let path = req.file.path;
    var workbook = XLSX.readFile(path);
    var sheet_name_list = workbook.SheetNames;
    let jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]],
      { raw: false }
    );
    const header = [];
    const columnCount =
      XLSX.utils.decode_range(workbook.Sheets[sheet_name_list[0]]["!ref"]).e.c +
      1;
    for (let i = 0; i < columnCount; ++i) {
      header[i] =
        workbook.Sheets[sheet_name_list[0]][`${XLSX.utils.encode_col(i)}1`].v;
    }

    if (!(header.sort().join(",") === worksheetColumns.sort().join(","))) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.EXCEL_FILE_INVALID,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
    if (jsonData.length === 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.EXCEL_FILE_EMPTY,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }

    let failedTasks = { count: 0, data: [] },
      successTasks = { count: 0, data: [] };

    for (let i = 0; i < jsonData.length; i++) {
      jsonData[i].due_date = jsonData[i].due_date
        ? moment(new Date(jsonData[i].due_date)).format()
        : moment(new Date()).set({ hour: 23, minute: 59, second: 59 }).format();
      jsonData[i].assigned_on = jsonData[i].assigned_on
        ? moment(new Date(jsonData[i].assigned_on)).format()
        : moment(new Date()).format();

      if (
        jsonData[i].title == undefined ||
        jsonData[i].title == "" ||
        jsonData[i].title == null ||
        jsonData[i].project_code == undefined ||
        jsonData[i].project_code == "" ||
        jsonData[i].project_code == null ||
        jsonData[i].employee_code == undefined ||
        jsonData[i].employee_code == "" ||
        jsonData[i].employee_code == null ||
        jsonData[i].client_time == undefined ||
        jsonData[i].client_time == "" ||
        jsonData[i].client_time == null ||
        jsonData[i].with_tracker == undefined ||
        jsonData[i].with_tracker == null
      ) {
        failedTasks.count++;
        failedTasks.data.push(jsonData[i]);
      } else {
        let flag = true;

        // for checking existing title in same project
        // const existTitle = await Tasks.findOne({
        //   title: { $regex: `^${jsonData[i].title}$`, $options: "i" },
        //   project_code: jsonData[i].project_code,
        // });
        // if (existTitle) {
        //   flag = false;
        //   if (!failedTasks.data.some((e) => e.title == jsonData[i].title)) {
        //     failedTasks.count++;
        //     failedTasks.data.push(jsonData[i]);
        //   }
        // }

        // for checking project_code exists or not
        await checkColumn(
          Project,
          "project_code",
          jsonData[i].project_code,
          "SUCCESS",
          "FAILED",
          ENUMS.VALIDATION_TYPE.EXISTS
        ).catch((err) => {
          flag = false;
          if (!failedTasks.data.some((e) => e.title == jsonData[i].title)) {
            failedTasks.count++;
            failedTasks.data.push(jsonData[i]);
          }
        });

        // for checking employee_code exists or not
        await checkColumn(
          Employee,
          "employee_code",
          jsonData[i].employee_code,
          "SUCCESS",
          "FAILED",
          ENUMS.VALIDATION_TYPE.EXISTS
        ).catch((err) => {
          flag = false;
          if (!failedTasks.data.some((e) => e.title == jsonData[i].title)) {
            failedTasks.count++;
            failedTasks.data.push(jsonData[i]);
          }
        });

        // for checking employee_code in project or not
        let data = await Employee_Project.findOne({
          employee_code: jsonData[i].employee_code,
          project_code: jsonData[i].project_code,
          is_deleted: false,
          is_disable: false,
        });

        if (!data) {
          flag = false;
          if (!failedTasks.data.some((e) => e.title == jsonData[i].title)) {
            failedTasks.count++;
            failedTasks.data.push(jsonData[i]);
          }
        }

        if (flag) {
          let newData = {
            title: jsonData[i].title,
            description: jsonData[i].description,
            project_code: jsonData[i].project_code,
            employee_code: jsonData[i].employee_code,
            client_time: jsonData[i].client_time,
            with_tracker: jsonData[i].with_tracker.toLowerCase(),
            due_date: jsonData[i].due_date,
            assigned_on: jsonData[i].assigned_on,
            created_by: auth_employee_code,
            created_date: moment().format(),
            status_history: [
              {
                status_from: null,
                status_to: ENUMS.TASK_STATUS.TODO,
                updated_by: auth_employee_code,
                updated_date: moment().format(),
              },
            ],
          };

          successTasks.count++;
          successTasks.data.push(newData);
        }
      }
    }

    if (successTasks.data.length) {
      await Tasks.create(successTasks.data);
    }

    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: TASK_MESSAGE.TASK_SAVED,
      data: {
        failedTasks: failedTasks,
        successTasks: successTasks,
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

/* Export today's task which is in QA stage */
// -----Cron job------------------------
cron.schedule("0 18 * * *", async function () {
  try {
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    var getTasks = await Tasks.find({
      is_deleted: false,
      status: ENUMS.TASK_STATUS.READY_TO_QA,
      status_history: {
        $elemMatch: {
          status_to: ENUMS.TASK_STATUS.READY_TO_QA,
          updated_date: {
            $gte: start,
            $lt: end,
          },
        },
      },
    }).select({
      _id: 1,
      title: 1,
      description: 1,
      project_code: 1,
      employee_code: 1,
      client_time: 1,
      with_tracker: 1,
      due_date: 1,
      assigned_on: 1,
    });

    if (getTasks.length) {
      getTasks = JSON.parse(JSON.stringify(getTasks));

      var worksheetColumns = [
        [
          "title",
          "description",
          "project_code",
          "employee_code",
          "client_time",
          "with_tracker",
          "due_date",
          "assigned_on",
          "_id",
        ],
      ];

      let newArray = [];
      getTasks.forEach((el) => {
        let newObj = {};
        worksheetColumns[0].forEach((e) => {
          if (el.hasOwnProperty(e)) {
            newObj[e] = el[e];
          }
        });
        newArray.push(newObj);
      });

      let newArrayForFiles = [];
      newArray.forEach((e) => {
        if (!newArrayForFiles.some((el) => el.project_code == e.project_code)) {
          newArrayForFiles.push({
            project_code: e.project_code,
            tasks: [e],
          });
        } else {
          newArrayForFiles.find((el) => {
            if (el.project_code == e.project_code) {
              el.tasks.push(e);
              return true;
            }
          });
        }
      });

      const folderCreate = path.resolve("public/images/" + "tasks");
      if (!fs.existsSync(folderCreate)) fs.mkdirSync(folderCreate);

      let newFiles = [];
      newArrayForFiles.forEach((element) => {
        var filePath =
          folderCreate +
          "/" +
          element.project_code +
          "_" +
          Date.now() +
          ".xlsx";

        var worksheetName = `Ready_To_QA_${element.project_code}`;
        var workbook = XLSX.utils.book_new();
        var worksheet = XLSX.utils.json_to_sheet(element.tasks, {
          origin: "A2",
          skipHeader: true,
        });
        XLSX.utils.sheet_add_aoa(worksheet, worksheetColumns);
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
        XLSX.writeFile(workbook, path.resolve(filePath));
        newFiles.push(path.resolve(filePath));
      });

      let getProjectCodes = newArray.map((e) => e.project_code);
      let getAllProjects = await Project.aggregate([
        {
          $match: {
            project_code: { $in: getProjectCodes },
            is_deleted: false,
          },
        },
        {
          $lookup: {
            from: LEAD,
            let: { l_code: "$lead_code" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$lead_code", "$$l_code"] },
                  is_deleted: false,
                },
              },
              {
                $project: {
                  _id: 0,
                  lead_assign: 1,
                },
              },
            ],
            as: "leads",
          },
        },
        {
          $unwind: {
            path: "$leads",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            leads: "$leads.lead_assign",
          },
        },
        { $unwind: "$leads" },
        {
          $lookup: {
            from: EMPLOYEE,
            let: { l_code: "$leads" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$l_code"] },
                  is_deleted: false,
                },
              },
              {
                $project: {
                  _id: 0,
                  email: 1,
                },
              },
            ],
            as: "employees",
          },
        },
        { $unwind: "$employees" },
        {
          $group: {
            _id: "$_id",
            project_code: { $first: "$project_code" },
            project_title: { $first: "$project_title" },
            lead_code: { $first: "$lead_code" },
            employees: { $push: "$employees" },
          },
        },
        {
          $addFields: {
            employees: "$employees.email",
          },
        },
      ]);

      for (let i = 0; i < newArrayForFiles.length; i++) {
        if (
          getAllProjects.some(
            (el) => el.project_code == newArrayForFiles[i].project_code
          )
        ) {
          let getEmployees = getAllProjects.find(
            (el) => el.project_code == newArrayForFiles[i].project_code
          );

          let filename = newFiles.find((e) =>
            e.includes(getEmployees.project_code)
          );

          await changeTaskStatusMailer(
            getEmployees.project_title,
            getEmployees.employees,
            filename
          );
        }
      }

      await Cron_Job_Logs.create({
        title: "Export Excel file cron running.",
        status: "Success",
        message: "Tasks found in ready to review",
        created_date: moment().format(),
      });

      console.log("Cron run successfully.");
    } else {
      await Cron_Job_Logs.create({
        title: "Export Excel file cron running.",
        status: "Success",
        message: "No tasks found in ready to review",
      });
      console.log("Cron has no data.");
    }
  } catch (error) {
    await Cron_Job_Logs.create({
      title: "Cron run with errors.",
      status: "Failed",
      message: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
      created_date: moment().format(),
    });
    console.log("Cron run with errors.");
  }
});

/* Read excel file and get all tasks for do it done. // METHOD: GET */
const getAllTasksForDone = async (req, res) => {
  try {
    const { filename } = req.params;
    let path = "public/images/tasks/" + filename + ".xlsx";

    if (!fs.existsSync(path)) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.EXCEL_FILE_NOT_FOUND,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }

    var workbook = XLSX.readFile(path);
    var sheet_name_list = workbook.SheetNames;
    let jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    if (jsonData.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_FOUND,
        data: jsonData,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.TASK_NOT_FOUND,
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

// Make all tasks for do it done. // METHOD: POST // PARAMS: tasks:["task_id"] */
const makeTasksDone = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { tasks } = req.body;
    let result = await Tasks.updateMany(
      { _id: { $in: tasks } },
      {
        $set: {
          $push: {
            status_history: {
              status_from: ENUMS.TASK_STATUS.READY_TO_QA,
              status_to: ENUMS.TASK_STATUS.DONE,
              updated_by: auth_employee_code,
              updated_date: moment().format(),
            },
          },
          status: ENUMS.TASK_STATUS.DONE,
          updated_by: auth_employee_code,
          updated_date: moment().format(),
        },
      }
    );
    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_SAVED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.TASK_NOT_SAVED,
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

/* Change TASK STATUS // METHOD: PUT // PAYLOAD: employee_code, task_id, status_from, status_to */
const changeTaskStatus = async (req, res) => {
  try {
    const { employee_code, task_id, status_from, status_to } = req.body;
    const { employee_code: auth_employee_code, role } = req[AUTH_USER_DETAILS];

    if (
      status_to.toLowerCase() == ENUMS.TASK_STATUS.IN_PROGRESS.toLowerCase()
    ) {
      let prevTask = await Tasks.findOne({
        status: ENUMS.TASK_STATUS.IN_PROGRESS,
        employee_code: employee_code,
        is_deleted: false,
        is_disabled: false,
      });

      if (prevTask) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: TASK_MESSAGE.TASK_EXISTS,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    let task_status = await Tasks.findByIdAndUpdate(
      task_id,
      {
        $push: {
          status_history: {
            status_from: status_from,
            status_to: status_to,
            updated_by: auth_employee_code,
            updated_date: moment().format(),
          },
        },
        status: status_to,
        updated_by: auth_employee_code,
        updated_date: moment().format(),
      },
      { new: true }
    );
    const comments = await Task_Comments.find({ task_id });

    if (task_status) {
      task_status = {
        ...task_status._doc,
        comments: comments,
        due_date: dateAndTimeFormat(task_status._doc.due_date, "Asia/Kolkata"),
        assigned_on: dateAndTimeFormat(
          task_status._doc.assigned_on,
          "Asia/Kolkata"
        ),
      };
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_SAVED,
        // data: { ...task_status._doc, comments },
        data: task_status,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.TASK_NOT_SAVED,
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

/* UPDATE TASK // METHOD: PUT // PAYLOAD: employee_code, task_id, status_from, status_to */
const updateTask = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { task_id } = req.params;

    if (req.body.due_date) {
      req.body.due_date = momentTimezone
        .tz(new Date(req.body.due_date), "Asia/Kolkata")
        .format();
    }
    if (req.body.assigned_on) {
      req.body.assigned_on = momentTimezone
        .tz(new Date(req.body.assigned_on), "Asia/Kolkata")
        .format();
    }
    const updatedObj = {
      ...req.body,
      updated_by: auth_employee_code,
      updated_date: moment().format(),
    };

    let result = await Tasks.findByIdAndUpdate(task_id, updatedObj, {
      new: true,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_SAVED,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.TASK_NOT_SAVED,
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

/* DELETE TASK // METHOD: DELETE // PARAMS: task_id */
const deleteTask = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { task_id } = req.params;

    let result = await Tasks.findByIdAndUpdate(
      task_id,
      { is_deleted: true, deleted_by: auth_employee_code },
      {
        new: true,
      }
    );

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.TASK_NOT_DELETED,
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

/* DELETE TASK HARD // METHOD: DELETE // PARAMS: task_id */
const deleteTaskHard = async (req, res) => {
  try {
    const { task_id } = req.params;

    let result = await Tasks.findByIdAndDelete(task_id);

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TASK_MESSAGE.TASK_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TASK_MESSAGE.TASK_NOT_DELETED,
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

/* LIST TEAM TASK // METHOD: GET */
const teamTaskList = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];

    const teamManagement = await Team_managment.findOne({
      team_leader: employee_code,
    });

    if (teamManagement) {
      const teamMembers = teamManagement.team_member;
      const tasks = await Tasks.aggregate([
        {
          $match: { employee_code: { $in: teamMembers } },
        },
        {
          $group: {
            _id: "$employee_code",
            task_details: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            employee_code: "$_id",
            task_details: 1,
          },
        },
      ]);

      const teamMemberTasksMap = new Map();
      tasks.forEach((task) => {
        teamMemberTasksMap.set(task.employee_code, task.task_details);
      });

      const teamMembersWithTasks = teamMembers.map((member) => {
        const tasks = teamMemberTasksMap.get(member);
        return {
          employee_code: member,
          task_details: tasks || "---",
        };
      });

      if (teamMembersWithTasks.length > 0) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TEAM_MESSAGE.TEAM_TASK_FOUND,
          data: teamMembersWithTasks,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TEAM_MESSAGE.TEAM_TASK_NOT_FOUND,
          data: [],
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_NOT_FOUND,
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
  addTask,
  listTasks,
  listAllTasks,
  listTasksById,
  updateTask,
  changeTaskStatus,
  deleteTask,
  deleteTaskHard,
  addTaskByExcelFile,
  getAllTasksForDone,
  makeTasksDone,
  allEmployeeTaskInfotracker,
  teamTaskList,
  listTaskHour,
  // checkTaskDate,
};
