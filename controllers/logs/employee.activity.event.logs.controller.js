const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const { EMPLOYEE } = require("../../constants/models.enum.constants");
const {
  EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE,
} = require("../../controller-messages/log-messages/employee.activity.event.log.messages");
const {
  employee_activity_event_log,
} = require("../../models/logs/employee.activity.event.logs");

/* LIST ALL EMPLOYEE'S ACTIVITY EVENT LOGS // METHOD: POST // PAYLOAD:  */
const listEmployeeActivityEventLogs = async (req, res) => {
  try {
    let result = await employee_activity_event_log.aggregate([
      {
        $match: { is_deleted: false },
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
        $project: {
          is_deleted: 0,
          updated_by: 0,
          deleted_by: 0,
        },
      },
    ]);

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_NOT_FOUND,
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
/* LIST ALL EMPLOYEE'S ACTIVITY EVENT LOGS // METHOD: POST // PAYLOAD:  */
const listSelectedEmployeeActivityEventLogs = async (req, res) => {
  try {
    const { employee_code } = req.params;
    const d = new Date();

    // let start_date = new Date(d.setHours(d.getHours() - d.getHours()));
    // let end_date = new Date(d.setDate(d.getDate() + 1));
    
    let start_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 30, 0, 0);
    let end_date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 5, 29, 0, 0);

    const filter = req.body.filter;

    if (filter && filter.date) {
      const { start, end } = filter.date;
      if (start) {
        start_date = new Date(start);
      }
      if (end) {
        end_date = new Date(end);
      }
    }

    let result = await employee_activity_event_log.aggregate([
      {
        $match: {
          employee_code: employee_code,
          createdAt: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
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
        $project: {
          is_deleted: 0,
          updated_by: 0,
          deleted_by: 0,
        },
      },
    ]);

    if (result && result.length > 0) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_NOT_FOUND,
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

/* ADD NEW EMPLOYEE'S ACTIVITY EVENT LOG // METHOD: POST */
/* PAYLOAD: { employee_code, events, screenshot } */
const addEmployeeActivityEventLogs = async (req, res) => {
  try {
    const { employee_code, events, screenshot } = req.body;
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const activity_events = await employee_activity_event_log.create({
      employee_code,
      events,
      screenshot,
      created_by: auth_employee_code,
    });
    if (activity_events) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_ADDED,
        data: activity_events,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_NOT_ADDED,
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

/* UPDATE EMPLOYEE'S ACTIVITY EVENT LOG // METHOD: PUT */
/* PAYLOAD: events:{}, screenshot */
const updateEmployeeActivityEventLogs = async (req, res) => {
  try {
    const { employee_code: auth_employee_code } = req[AUTH_USER_DETAILS];
    const { activity_id } = req.params;
    const { events, screenshot } = req.body;

    var updatedObj = { updated_by: auth_employee_code };
    if (events) {
      updatedObj = {
        ...updatedObj,
        $push: {
          events: events,
        },
      };
    }
    if (screenshot) {
      updatedObj = {
        ...updatedObj,
        screenshot: screenshot,
      };
    }

    let result = await employee_activity_event_log.findByIdAndUpdate(
      activity_id,
      updatedObj,
      { new: true }
    );

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_UPDATE,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error:
          EMPLOYEE_ACTIVITY_EVENT_LOG_MESSAGE.EMPLOYEE_ACTIVITY_EVENT_LOG_NOT_UPDATE,
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
  addEmployeeActivityEventLogs,
  updateEmployeeActivityEventLogs,
  listEmployeeActivityEventLogs,
  listSelectedEmployeeActivityEventLogs,
};
