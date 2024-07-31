const { ENUMS } = require("../../constants/enum.constants");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const { EMPLOYEE } = require("../../constants/models.enum.constants");
const {
  LEAVE_MESSAGE,
} = require("../../controller-messages/leave-messages/leave.messages");
const io = require("../../helpers/socket");
const {
  TEAM_MESSAGE,
} = require("../../controller-messages/teammanagment-messages/team.managment.messages");
const Employee = require("../../models/employee/employee.model");
const Leave = require("../../models/leave/leave.model");
const { Sockets } = require("../../models/socket/socket.model");
const {
  listEmployeeGroupsForAll,
  listAllEmployeePermissions,
} = require("../group/employee.group.controller");
const Team_managment = require("../../models/team_managment/team.managment.model");
const {
  sendEmailAddLeave,
  sendEmailUpdateLeaveStatus,
  sendEmailUpdateLeave,
} = require("../../services/mailer/LeaveMailTemplate");
const {
  removeDuplicates,
  getGroupEmailsByTitle,
  getTeamLeaderEmails,
} = require("../../helpers/fn");
const Group = require("../../models/group/group.model");
const Employee_Group = require("../../models/group/employee.group.model");

/* ADD NEW LEAVE // METHOD: POST */
const addLeave = async (req, res) => {
  try {
    const { leave_details } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    let existingData = [];
    let nonExistingData = [];

    for (const leave of leave_details) {
      const existingLeave = await Leave.findOne({
        leave_date: leave.leave_date,
        employee_code: employee_code,
        is_deleted: false,
      });

      if (existingLeave) {
        existingData.push(leave);
      } else {
        nonExistingData.push(leave);
      }
    }

    const newLeave = nonExistingData.map((element) => ({
      employee_code: employee_code,
      leave_date: element.leave_date,
      leave_type: element.leave_type,
      leave_category: element.leave_category,
      leave_reason: element.leave_reason,
      covering_hours: element.covering_hours,
      from: element.from,
      to: element.to,
    }));

    if (newLeave.length) {
      const leaveResult = await Leave.create(newLeave);
      if (leaveResult) {
        // let empPermissions = await listAllEmployeePermissions();
        // if (empPermissions.status) {
        //   let permissionArr = empPermissions.result.filter((o) =>
        //     o.permissions.includes("leave-employee-view")
        //   );

        //   let employeeList = permissionArr.map((e) => e.employee_code);
        //   let employeeSockets = await Sockets.find({
        //     employee_code: { $in: employeeList },
        //     is_deleted: false,
        //   });

        //   let socketIds = employeeSockets.map((s) => s.socket_id);
        //   io.to(socketIds).emit("newLeaveNotification", leaveResult);
        // }
        // let toEmails = ["hr@alitainfotech.com", "parimal.alitainfotech@gmail.com"]
        let toEmails = [];

        const hrEmail = await getGroupEmailsByTitle("HR manager");
        toEmails.push(...hrEmail);

        const team_lead = await Team_managment.find({
          team_member: { $in: employee_code },
        }).select({ _id: 0, team_leader: 1 });

        if (team_lead.length) {
          const teamLeaderEmails = await getTeamLeaderEmails(team_lead);
          toEmails.push(...teamLeaderEmails);
        } else {
          const adminEmail = await getGroupEmailsByTitle("admin");
          toEmails.push(...adminEmail);
        }

        const { _doc: payload } = await Employee.findOne({
          employee_code: employee_code,
        }).select({ _id: 0, firstname: 1, lastname: 1, email: 1 });
        payload.newLeave = newLeave;

        const lastMail = toEmails.filter((mail) => mail !== payload.email);

        const newEmail = removeDuplicates(lastMail);

        await sendEmailAddLeave(newEmail, "Applied for leave", payload);
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAVE_MESSAGE.LEAVE_ADDED,
          data: leaveResult,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: [],
          error: LEAVE_MESSAGE.LEAVE_NOT_ADDED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_EXIST,
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
      error: error.message || RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* UPDATE LEAVE STATUS FOR HR // METHOD: PUT // PARAMS: _id */
const updateLeaveStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { leave_status, reject_reason } = req.body;

    const updateLeaveStatus = await Leave.findByIdAndUpdate(
      _id,
      {
        leave_status: leave_status,
        reject_reason: reject_reason,
        approve_rejected_by: auth_employee_code,
        approve_rejected_on: new Date(),
        updated_by: auth_employee_code,
      },
      { new: true }
    );
    if (updateLeaveStatus) {
      let toEmails = [];
      const leavEmployee_code = await Leave.findById(_id).select({
        _id: 0,
        employee_code: 1,
      });
      const x = leavEmployee_code.employee_code;

      const employeeEmail = await Employee.findOne({ employee_code: x }).select(
        { _id: 0, email: 1, firstname: 1, lastname: 1 }
      );

      const hrEmail = await getGroupEmailsByTitle("HR manager");

      toEmails.push(...hrEmail, employeeEmail.email);

      const colour =
        leave_status === ENUMS.LEAVE_STATUS.APPROVE
          ? "green"
          : leave_status === ENUMS.LEAVE_STATUS.REJECTED
          ? "red"
          : leave_status === ENUMS.LEAVE_STATUS.UNAPPROVE
          ? "#d8bd44"
          : "black";

      let { _doc: payload } = await Employee.findOne({
        employee_code: auth_employee_code,
      }).select({ _id: 0, firstname: 1, lastname: 1, email: 1 });
      payload.leaveFirst = employeeEmail.firstname;
      payload.leaveLast = employeeEmail.lastname;
      payload.leave_status = leave_status;
      payload.colour = colour;

      const team_lead = await Team_managment.find({
        team_member: { $in: x },
      }).select({ _id: 0, team_leader: 1 });
      if (team_lead.length) {
        const teamLeaderEmails = await getTeamLeaderEmails(team_lead);
        toEmails.push(...teamLeaderEmails);
      } else {
        const adminEmail = await getGroupEmailsByTitle("admin");
        toEmails.push(...adminEmail);
      }

      const lastMail = toEmails.filter((mail) => mail !== payload.email);

      const newEmail = removeDuplicates(lastMail);

      await sendEmailUpdateLeaveStatus(
        newEmail,
        "Status of your leave",
        payload
      );
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_UPDATE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: LEAVE_MESSAGE.LEAVE_NOT_UPDATE,
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

/* UPDATE LEAVE FOR EMPLOYEE // METHOD: PUT // PARAMS: _id */
const updateLeave = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];
    const {
      leave_date,
      leave_type,
      leave_category,
      leave_reason,
      covering_hours,
      from,
      to,
    } = req.body;

    const checkData = await Leave.findById(_id).select({ leave_status: 1 });
    if (checkData.leave_status === "approve") {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_APPROVE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const updateLeave = await Leave.findByIdAndUpdate(
        _id,
        {
          leave_date: leave_date,
          leave_type: leave_type,
          leave_category: leave_category,
          leave_reason: leave_reason,
          covering_hours: covering_hours,
          from: from,
          to: to,
          updated_by: employee_code,
        },
        { new: true }
      );
      if (updateLeave) {
        let toEmails = [];

        const hrEmail = await getGroupEmailsByTitle("HR manager");
        toEmails.push(...hrEmail);

        const team_lead = await Team_managment.find({
          team_member: { $in: employee_code },
        }).select({ _id: 0, team_leader: 1 });

        if (team_lead.length) {
          const teamLeaderEmails = await getTeamLeaderEmails(team_lead);
          toEmails.push(...teamLeaderEmails);
        } else {
          const adminEmail = await getGroupEmailsByTitle("admin");
          toEmails.push(...adminEmail);
        }

        const { _doc: payload } = await Employee.findOne({
          employee_code: employee_code,
        }).select({ _id: 0, firstname: 1, lastname: 1, email: 1 });
        payload.updateLeave = updateLeave;

        const lastMail = toEmails.filter((mail) => mail !== payload.email);

        const newEmail = removeDuplicates(lastMail);

        await sendEmailUpdateLeave(newEmail, "Updated for leave", payload);

        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAVE_MESSAGE.LEAVE_UPDATE,
          data: updateLeave,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: LEAVE_MESSAGE.LEAVE_NOT_UPDATE,
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

/* DELETE LEAVE // METHOD: PUT // PARAMS: _id */
const deleteLeave = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Leave.findByIdAndUpdate(
      { _id },
      {
        is_deleted: true,
        deleted_by: employee_code,
      }
    );

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: LEAVE_MESSAGE.LEAVE_NOT_DELETED,
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

/* LIST ALL LEAVE // METHOD: POST // PAYLOAD: filter */
const listAllLeave = async (req, res) => {
  try {
    const { filter, sort, current_page, per_page } = req.body;
    const { date, leave_status, employee_code } = filter;

    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;

    const date_start = date
      ? date.start
        ? date.start
        : new Date("1947-08-15")
      : new Date("1947-08-15");
    const date_end = date ? (date.end ? date.end : new Date()) : new Date();

    const sort_column = sort
      ? sort.column
        ? sort.column
        : "new_leave_date"
      : "new_leave_date";

    const sort_column_key =
      sort_column === "leave_date"
        ? "leave_date"
        : sort_column === "leave_reason"
        ? "leave_reason"
        : sort_column === "leave_status"
        ? "leave_status"
        : sort_column === "leave_type"
        ? "leave_type"
        : sort_column === "createdAt"
        ? "createdAt"
        : sort_column === "employee_name"
        ? "employee_name"
        : "new_leave_date";
    const order_by = sort
      ? sort.column
        ? sort.order
          ? sort.order
          : -1
        : -1
      : -1;

    let matchQuery;
    const { teamMembers } = req[AUTH_USER_DETAILS];

    if (date.start == null && date.end == null) {
      matchQuery = {
        createdAt: {
          $gte: new Date(date_start),
          $lte: new Date(date_end),
        },
        is_deleted: false,
        employee_code: { $in: teamMembers },
      };
    } else {
      matchQuery = {
        new_leave_date: {
          $gte: new Date(date_start),
          $lte: new Date(date_end),
        },
        is_deleted: false,
        employee_code: { $in: teamMembers },
      };
    }

    if (employee_code && (employee_code != null || employee_code != "")) {
      matchQuery["employee_code"] = employee_code;
    }

    if (leave_status === ENUMS.LEAVE_STATUS.APPROVE) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.APPROVE;
    } else if (leave_status === ENUMS.LEAVE_STATUS.PENDING) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.PENDING;
    } else if (leave_status === ENUMS.LEAVE_STATUS.REJECTED) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.REJECTED;
    } else if (leave_status === ENUMS.LEAVE_STATUS.UNAPPROVE) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.UNAPPROVE;
    }

    const listAllLeave = await Leave.aggregate([
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
        $match: matchQuery,
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { emp_code: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$emp_code"] },
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
        },
      },
      {
        $sort: { leave_status: 1, new_leave_date: -1 },
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

    if (listAllLeave && listAllLeave.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_FOUND,
        data: listAllLeave,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_NOT_FOUND,
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

/* LIST EMPLOYEE LEAVE // METHOD: POST // PAYLOAD: filter */
const listLeaveEmployee = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { filter, sort, current_page, per_page } = req.body;
    const { date, leave_status } = filter;

    const current_page_f = current_page ? current_page : 1;
    const per_page_f = per_page ? per_page : 25;

    const date_start = date
      ? date.start
        ? date.start
        : new Date("1947-08-15").getTime()
      : new Date("1947-08-15").getTime();

    const date_end = date ? (date.end ? date.end : new Date()) : new Date();

    const sort_column = sort
      ? sort.column
        ? sort.column
        : "new_leave_date"
      : "new_leave_date";

    const sort_column_key =
      sort_column === "leave_date"
        ? "leave_date"
        : sort_column === "leave_reason"
        ? "leave_reason"
        : sort_column === "leave_status"
        ? "leave_status"
        : sort_column === "leave_type"
        ? "leave_type"
        : sort_column === "createdAt"
        ? "createdAt"
        : sort_column === "employee_name"
        ? "employee_name"
        : "new_leave_date";
    const order_by = sort
      ? sort.column
        ? sort.order
          ? sort.order
          : -1
        : -1
      : -1;

    let matchQuery;

    if (date.start == null && date.end == null) {
      matchQuery = {
        createdAt: {
          $gte: new Date(date_start),
          $lte: new Date(date_end),
        },
        is_deleted: false,
        employee_code: employee_code,
      };
    } else {
      matchQuery = {
        new_leave_date: {
          $gte: new Date(date_start),
          $lte: new Date(date_end),
        },
        is_deleted: false,
        employee_code: employee_code,
      };
    }

    if (leave_status === ENUMS.LEAVE_STATUS.APPROVE) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.APPROVE;
    } else if (leave_status === ENUMS.LEAVE_STATUS.PENDING) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.PENDING;
    } else if (leave_status === ENUMS.LEAVE_STATUS.REJECTED) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.REJECTED;
    } else if (leave_status === ENUMS.LEAVE_STATUS.UNAPPROVE) {
      matchQuery.leave_status = ENUMS.LEAVE_STATUS.UNAPPROVE;
    }

    const listEmployeeLeave = await Leave.aggregate([
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
        $match: matchQuery,
      },
      {
        $sort: { leave_status: 1, new_leave_date: -1 },
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

    if (listEmployeeLeave && listEmployeeLeave.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_FOUND,
        data: listEmployeeLeave,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_NOT_FOUND,
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

/* GET ONE LEAVE BY ID// METHOD: GET // PARAMS: _id */
const getOneLeave = async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await Leave.findById({ _id });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.LEAVE_NOT_FOUND,
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

const checkShortLeave = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const currentMonth = new Date().getMonth() + 1;

    const result = await Leave.aggregate([
      {
        $match: {
          employee_code,
          leave_category: ENUMS.LEAVE_CATEGORY.SHORT,
          is_deleted: false,
        },
      },
      {
        $addFields: {
          leave_date_parsed: {
            $dateFromString: {
              dateString: "$leave_date",
              format: "%d-%m-%Y",
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$leave_date_parsed" }, currentMonth],
          },
        },
      },
    ]);

    if (result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.SHORT_LEAVE_FOUND,
        data: result[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: LEAVE_MESSAGE.SHORT_LEAVE_NOT_FOUND,
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

/* LIST TEAM TASK // METHOD: GET */
const teamLeaveList = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { filter } = req.body;
    const { date, employee_code: filterEmployeeCode } = filter;

    const teamManagement = await Team_managment.findOne({
      team_leader: employee_code,
    });

    if (teamManagement) {
      const teamMembers = teamManagement.team_member;
      const date_start = date
        ? date.start
          ? date.start
          : new Date("1947-08-15")
        : new Date("1947-08-15");
      const date_end = date ? (date.end ? date.end : new Date()) : new Date();

      let matchQuery;

      if (date.start == null && date.end == null) {
        matchQuery = {
          createdAt: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
          is_deleted: false,
        };
      } else {
        matchQuery = {
          new_leave_date: {
            $gte: new Date(date_start),
            $lte: new Date(date_end),
          },
          is_deleted: false,
        };
      }

      if (
        filterEmployeeCode &&
        (filterEmployeeCode != null || filterEmployeeCode != "")
      ) {
        matchQuery["employee_code"] = filterEmployeeCode;
      }

      matchQuery.leave_status = ENUMS.LEAVE_STATUS.APPROVE;

      const leaves = await Leave.aggregate([
        {
          $match: { employee_code: { $in: teamMembers } },
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
          $match: matchQuery,
        },
        {
          $group: {
            _id: "$employee_code",
            leave_details: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: EMPLOYEE,
            localField: "_id",
            foreignField: "employee_code",
            as: "employee",
          },
        },
        {
          $unwind: {
            path: "$employee",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            employee_code: "$_id",
            employee_name: {
              $cond: {
                if: "$employee",
                then: {
                  $concat: ["$employee.firstname", " ", "$employee.lastname"],
                },
                else: "---",
              },
            },
            leave_details: 1,
          },
        },
      ]);

      if (leaves.length > 0) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAVE_MESSAGE.TEAM_LEAVE_FOUND,
          data: leaves,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: LEAVE_MESSAGE.TEAM_LEAVE_NOT_FOUND,
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
  addLeave,
  updateLeaveStatus,
  updateLeave,
  deleteLeave,
  listAllLeave,
  listLeaveEmployee,
  getOneLeave,
  checkShortLeave,
  teamLeaveList,
};
