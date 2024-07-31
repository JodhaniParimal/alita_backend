const { default: mongoose } = require("mongoose");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const {
  EMPLOYEE,
  EMPLOYEE_TRACKER,
  TRACKER_INFO,
} = require("../../constants/models.enum.constants");
const {
  LEAD_MESSAGES,
} = require("../../controller-messages/lead-messages/lead.messages");
const {
  TRACKER_MESSAGE,
} = require("../../controller-messages/tracker-messages/tracker.messages");
const { timeDiff } = require("../../helpers/trackerTimeDifference");
const Employee = require("../../models/employee/employee.model");
const { tracker } = require("../../models/tracker/tracker.model");
const {
  Screenshot,
} = require("../../models/trackerscreenshot/trackerscreenshot.model");
const { ObjectId } = require("mongodb");
const { Tracker_info } = require("../../models/tracker/tracker.info.model");

/* ADD NEW TIME // METHOD: POST */
/* PAYLOAD: { start_time, employee_code, is_idle, is_break, clock_out } */
const addTime = async (req, res) => {
  try {
    const { start_time, employee_code, is_idle, is_break, clock_out } =
      req.body;
    let createObj = { start_time, employee_code };
    if (is_break) {
      createObj = { ...createObj, is_break };
    }
    if (is_idle) {
      createObj = { ...createObj, is_idle };
    }
    if (clock_out) {
      createObj = { ...createObj, clock_out };
    }
    const { _doc: addTrackerTime } = await tracker.create(createObj);

    if (addTrackerTime) {
      const trackerObj = {
        ...addTrackerTime,
        tracker_id: addTrackerTime._id,
      };

      delete trackerObj._id;

      const currentDate = new Date();
      const currentDateStart = new Date(currentDate);
      currentDateStart.setHours(0, 0, 0, 0);

      const currentDateEnd = new Date(currentDate);
      currentDateEnd.setHours(23, 59, 59, 999);

      const existData = await Tracker_info.findOne({
        employee_code: employee_code,
        createdAt: {
          $gte: currentDateStart,
          $lte: currentDateEnd,
        },
      });

      let tracker_info;

      if (existData) {
        tracker_info = await Tracker_info.findOneAndUpdate(
          {
            employee_code: employee_code,
            createdAt: {
              $gte: currentDateStart,
              $lte: currentDateEnd,
            },
          },
          {
            $push: {
              tracker_info: trackerObj,
            },
            updated_by: employee_code,
          }
        );
      } else {
        tracker_info = await Tracker_info.create({
          employee_code: employee_code,
          tracker_info: trackerObj,
          created_by: employee_code,
        });
      }

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.TRACKER_TIME_ADDED,
        data: addTrackerTime,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.TRACKER_TIME_NOT_ADDED,
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

/* UPDATE TIME // METHOD: PUT // PARAMS: id */
/* PAYLOAD: { end_time, is_idle, is_break,clock_out } */
const updateTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { end_time, is_idle, is_break, clock_out } = req.body;
    let updateObj = { end_time };
    if (is_break) {
      updateObj = { ...updateObj, is_break };
    }
    if (is_idle) {
      updateObj = { ...updateObj, is_idle };
    }
    if (clock_out) {
      updateObj = { ...updateObj, clock_out };
    }

    const document = await tracker.findById(id);

    if (document) {
      const difference = timeDiff(document.start_time, end_time);

      const updateDoc = await tracker.findByIdAndUpdate(
        id,
        {
          ...updateObj,
          difference,
        },
        {
          new: true,
        }
      );
      if (updateDoc) {
        const currentDate = updateDoc.createdAt;
        const currentDateStart = new Date(currentDate);
        currentDateStart.setHours(0, 0, 0, 0);

        const currentDateEnd = new Date(currentDate);
        currentDateEnd.setHours(23, 59, 59, 999);
        const { _doc: updateObj } = { ...updateDoc };
        updateObj.tracker_id = updateObj._id;
        delete updateObj._id;

        await Tracker_info.findOneAndUpdate(
          {
            "tracker_info.tracker_id": id,
          },
          {
            $set: { "tracker_info.$": { ...updateObj } },
          },
          { new: true }
        );
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TRACKER_MESSAGE.TRACKER_TIME_UPDATE,
          data: updateDoc,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: TRACKER_MESSAGE.TRACKER_TIME_NOT_UPDATE,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TRACKER_MESSAGE.PASS_WRONG_DATA,
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

/* LIST Tracker FOR EMPLOYEE // METHOD: POST // PARAMS: employee_code // PAYLOAD: filter */
const trackerListingAsPerEmployee = async (req, res) => {
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

    const document = await Tracker_info.findOne({
      employee_code,
      createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) },
    });

    if (document) {
      const dd = JSON.parse(JSON.stringify([...document.tracker_info]))

      const data = dd.map(o => { return { ...o, employee_code } })

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.TRACKER_STATUS_FOUND,
        data: data,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.TRACKER_STATUS_NOT_FOUND,
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

/* LIST All Tracker // METHOD: POST // PAYLOAD: filter,search,sort */
const allEmployeeTrackerListing = async (req, res) => {
  try {
    const d = new Date();
    const { employee_code: logged_in_user } = req[AUTH_USER_DETAILS];

    const filter = req.body.filter;
    const { search, sort } = req.body;
    const search_by = search ? search : "";

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

    const sort_column = sort
      ? sort.column
        ? sort.column
        : "firstname"
      : "firstname";
    const sort_column_key =
      sort_column === "employee_code"
        ? "employee_code"
        : sort_column === "firstname"
          ? "firstname"
          : "firstname";

    const order_by = sort.order ? sort.order : -1;

    const { teamMembers } = req[AUTH_USER_DETAILS]

    const document = await Employee.aggregate([
      {
        $match: {
          $or: [
            { firstname: { $regex: `^${search_by}`, $options: "i" } },
            { employee_code: logged_in_user },
          ],
          employee_code: { $in: teamMembers },
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: TRACKER_INFO,
          // from: EMPLOYEE_TRACKER,
          let: { empCode: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$employee_code", "$$empCode"] },
                    { $gte: ["$createdAt", start_date] },
                    { $lt: ["$createdAt", end_date] },
                  ],
                },
              },
            },
          ],
          as: "tracker_info",
        },
      },
      {
        $sort: { firstname: 1 },
      },
      { $sort: { [sort_column_key]: order_by } },
      {
        $project: {
          _id: 0,
          employee_code: 1,
          employee_name: { $concat: ["$firstname", " ", "$lastname"] },
          tracker_info: {
            $cond: {
              if: { $eq: [{ $size: "$tracker_info" }, 1] },
              then: { $arrayElemAt: ["$tracker_info.tracker_info", 0] },
              else: [],
            },
          },
        },
      },
    ]);
    let active_users = [];
    let inactive_users = [];
    let idle_users = [];
    let user = document.find((o) => o.employee_code === logged_in_user);

    await document
      .filter((o) => o.employee_code !== logged_in_user)
      .map((o, i) => {
        if (o.tracker_info.length === 0) {
          inactive_users.push(o);
        } else if (o.tracker_info[o.tracker_info.length - 1].is_idle === true) {
          idle_users.push(o);
        } else {
          active_users.push(o);
        }
      });
    let result = { logged_in: user, idle_users, active_users, inactive_users };
    if (filter && filter.filter_key) {
      const { filter_key } = filter;
      if (filter_key === "active_users") {
        delete result.inactive_users;
        delete result.idle_users;
      } else if (filter_key === "inactive_users") {
        delete result.active_users;
        delete result.idle_users;
      } else if (filter_key === "idle_users") {
        delete result.active_users;
        delete result.inactive_users;
      } else {
        result = { ...result };
      }
    }
    if (document && result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.TRACKER_STATUS_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.TRACKER_STATUS_NOT_FOUND,
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

/* ADD NEW TRACKER SCREENSHOT // METHOD: POST // PAYLOAD: { file } */
const addtrackerScreenshot = async (req, res) => {
  try {
    const {
      file,
      employee_code,
      full_name,
      department,
      date,
      screenshot_name,
    } = req.body;

    const attachmentObj = {
      images: file,
      employee_code: employee_code,
      full_name: full_name,
      department: department,
      date: date,
      screenshot_name: screenshot_name,
      created_by: employee_code,
    };

    if (req.file) {
      const screenShot = await Screenshot.create(attachmentObj);
      if (screenShot) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TRACKER_MESSAGE.SCREENSHOT_ADDED_SUCCESS,
          data: screenShot,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: TRACKER_MESSAGE.SCREENSHOT_NOT_ADDED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: TRACKER_MESSAGE.SCREENSHOT_NOT_IN_REQ_FILE,
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

/* LIST Tracker Screenshot// METHOD: GET */
const listScreenshot = async (req, res) => {
  try {
    const screenShot = await Screenshot.find({ image_uploaded: false });

    if (screenShot) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.SCREENSHOT_FOUND,
        data: screenShot,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.SCREENSHOT_NOT_FOUND,
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

const updateUploadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = new mongoose.Types.ObjectId(id);

    const updateStatus = await Screenshot.findByIdAndUpdate(
      _id,
      {
        image_uploaded: true,
      },
      {
        new: true,
      }
    );
    if (updateStatus) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TRACKER_MESSAGE.SCREENSHOT_UPDATED_SUCCESS,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: TRACKER_MESSAGE.SCREENSHOT_NOT_UPDATED,
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
  addTime,
  updateTime,
  trackerListingAsPerEmployee,
  addtrackerScreenshot,
  allEmployeeTrackerListing,
  listScreenshot,
  updateUploadStatus,
};
