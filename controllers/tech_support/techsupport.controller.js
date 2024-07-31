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
  TECH_SUPPORT_MESSAGE,
} = require("../../controller-messages/techsupport-messages/techsupport.messages");
const { codeGenerator } = require("../../helpers/randomTicketNoGenerater");
const Tech_support = require("../../models/tech_support/tech_support.model");
const { Sockets } = require("../../models/socket/socket.model");
const {
  listAllEmployeePermissions,
} = require("../group/employee.group.controller");

const io = require("../../helpers/socket");
const { padWithLeadingZeros, removeDuplicates } = require("../../helpers/fn");
const Employee = require("../../models/employee/employee.model");
const { sendEmailAddSupportTicket, sendEmailUpdateSupportTicket } = require("../../services/mailer/SupportMailTemplate");
const Group = require("../../models/group/group.model");
const Employee_Group = require("../../models/group/employee.group.model");

/* ADD NEW TECH SUPPORT // METHOD: POST */
/* PAYLOAD: { problem, ticket_status, urgent } */
const addTechSupport = async (req, res) => {
  try {
    const { problem, ticket_status, urgent } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    // const ticket_code = await codeGenerator.generateTicketCode();
    const getLastTicketCode = await Tech_support.find().sort({ ticket_code: -1 }).limit(1);
    const nextNum = getLastTicketCode[0]?.ticket_code.replace(
      /(\d+)+/g,
      function (match, number) {
        let newCode = padWithLeadingZeros(parseInt(number) + 1, 6);
        return newCode;
      }
    );
    const ticket_code = nextNum ? nextNum : "111111";

    const createTicket = await Tech_support.create({
      employee_code,
      problem,
      ticket_status,
      urgent,
      ticket_code,
      created_by: employee_code,
    });

    if (createTicket) {
      // let empPermissions = await listAllEmployeePermissions();
      // if (empPermissions.status) {
      //   let permissionArr = empPermissions.result.filter((o) =>
      //     o.permissions.includes("tech-support-employee-view")
      //   );

      //   let employeeList = permissionArr.map((e) => e.employee_code);
      //   let employeeSockets = await Sockets.find({
      //     employee_code: { $in: employeeList },
      //     is_deleted: false,
      //   });

      //   let socketIds = employeeSockets.map((s) => s.socket_id);
      //   io.to(socketIds).emit("newTicketNotification", createTicket);
      // }

      // const colour =
      //   urgent ? "red" :
      //     "green";

      // const supportEmail = await getGroupEmailsByTitle("it_support")

      // let toEmails = [...supportEmail, "yaman.alitainfotech@gmail.com"]

      // const { _doc: payload } = await Employee.findOne({ employee_code: employee_code }).select({ _id: 0, firstname: 1, lastname: 1, email: 1 })
      // payload.colour = colour

      // const lastMail = toEmails.filter(mail => mail !== payload.email)

      // const newEmail = removeDuplicates(lastMail)

      // await sendEmailAddSupportTicket(newEmail, "New Support ticket rised", payload);
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_ADDED,
        data: createTicket,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_ADDED,
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

/* LIST One TECH SUPPORT By Id in PARAMS // METHOD: GET // PARAMS: _id */
const getOneTechSupport = async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await Tech_support.findById({ _id });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_FOUND,
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

/* UPDATE TECH SUPPORT // METHOD: PUT // PARAMS: _id */
/* PAYLOAD: { problem, urgent } */
const updateTechSupport = async (req, res) => {
  try {
    const { _id } = req.params;
    const { problem, urgent } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    const updateProblem = await Tech_support.findByIdAndUpdate(
      _id,
      {
        problem: problem,
        urgent: urgent,
        updated_by: employee_code,
      },
      { new: true }
    );

    if (updateProblem) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_UPDATE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_UPDATE,
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

/* UPDATE Tech Support ticket_status for IT Admin // METHOD: PUT // PARAMS: _id // PAYLOAD: ticket_status */
const updateTicketStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { ticket_status } = req.body;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const updateTicket_status = await Tech_support.findOneAndUpdate(
      { _id },
      {
        ticket_status: ticket_status,
        updated_by: auth_employee_code,
      },
      { new: true }
    );

    if (updateTicket_status) {
      // let toEmails = []
      // const supportEmployee_code = await Tech_support.findById(_id).select({ _id: 0, employee_code: 1 });
      // const x = supportEmployee_code.employee_code

      // const employeeEmail = await Employee.findOne({ employee_code: x }).select({ _id: 0, email: 1, firstname: 1, lastname: 1 });

      // const supportEmail = await getGroupEmailsByTitle("it_support")

      // toEmails = [...supportEmail, employeeEmail.email, "yaman.alitainfotech@gmail.com"]

      // let { _doc: payload } = await Employee.findOne({ employee_code: auth_employee_code }).select({ _id: 0, firstname: 1, lastname: 1, email: 1 })
      // payload.supportFirst = employeeEmail.firstname
      // payload.supportLast = employeeEmail.lastname

      // const lastMail = toEmails.filter(mail => mail !== payload.email)

      // const newEmail = removeDuplicates(lastMail)

      // await sendEmailUpdateSupportTicket(newEmail, "Status of your support ticket", payload);
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_UPDATE,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_UPDATE,
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

/* LIST EMPLOYEE TECH SUPPORT // METHOD: POST // PAYLOAD: filter */
const listTechSupportEmployee = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { filter } = req.body;
    const { date, ticket_status } = filter;

    const date_start = date
      ? date.start
        ? date.start
        : new Date("1947-08-15").getTime()
      : new Date("1947-08-15").getTime();

    const date_end = date ? (date.end ? date.end : new Date()) : new Date();

    let query = {
      is_deleted: false,
      employee_code: employee_code,
      createdAt: { $gte: date_start, $lte: date_end },
    };

    if (ticket_status === ENUMS.TICKET_STATUS.TICKET_STATUS_OPEN) {
      query.ticket_status = ENUMS.TICKET_STATUS.TICKET_STATUS_OPEN;
    } else if (ticket_status === ENUMS.TICKET_STATUS.TICKET_STATUS_COLSE) {
      query.ticket_status = ENUMS.TICKET_STATUS.TICKET_STATUS_COLSE;
    }

    let result = await Tech_support.find(query).sort({
      ticket_status: -1,
      createdAt: -1,
    });

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_FOUND,
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

/* LIST ALL TECH SUPPORT // METHOD: POST // PAYLOAD: filter */
const listAllTechSupport = async (req, res) => {
  try {
    const { filter } = req.body;
    const { date, ticket_status } = filter;

    const date_start = date
      ? date.start
        ? date.start
        : new Date("1947-08-15").getTime()
      : new Date("1947-08-15").getTime();
    const date_end = date ? (date.end ? date.end : new Date()) : new Date();

    const matchQuery = {
      createdAt: {
        $gte: new Date(date_start),
        $lte: new Date(date_end),
      },
      is_deleted: false,
    };

    if (ticket_status === ENUMS.TICKET_STATUS.TICKET_STATUS_OPEN) {
      matchQuery.ticket_status = ENUMS.TICKET_STATUS.TICKET_STATUS_OPEN;
    } else if (ticket_status === ENUMS.TICKET_STATUS.TICKET_STATUS_COLSE) {
      matchQuery.ticket_status = ENUMS.TICKET_STATUS.TICKET_STATUS_COLSE;
    }

    const listAllSupport = await Tech_support.aggregate([
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
        $sort: { ticket_status: -1, createdAt: -1 },
      },
    ]);

    if (listAllSupport && listAllSupport.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_FOUND,
        data: listAllSupport,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_FOUND,
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

/* DELETE TECH SUPPORT // METHOD: DELETE // PARAMS: _id */
const deleteTechSupport = async (req, res) => {
  try {
    const { _id } = req.params;
    const { employee_code } = req[AUTH_USER_DETAILS];

    let result = await Tech_support.findByIdAndUpdate(_id, {
      is_deleted: true,
      deleted_by: employee_code,
    });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TECH_SUPPORT_MESSAGE.TECH_SUPPORT_NOT_DELETED,
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
  addTechSupport,
  updateTechSupport,
  updateTicketStatus,
  listTechSupportEmployee,
  listAllTechSupport,
  deleteTechSupport,
  getOneTechSupport,
};
