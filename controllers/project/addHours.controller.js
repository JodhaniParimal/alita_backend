const { default: mongoose } = require("mongoose");
const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const { PROJECT, EMP_HOURS } = require("../../constants/models.enum.constants");
const {
  ADD_HOURS_MESSAGES,
} = require("../../controller-messages/project-messages/addHours.messages");
const {
  getCurrentDate,
  genratePdf,
  genratePdfAddHour,
  getToday,
  getCurrentWeekDates,
  getPreviousWeekDates,
} = require("../../helpers/fn");
const { Add_Hours } = require("../../models/project/addHours.model");
const { Project } = require("../../models/project/project.model");
const { ObjectId } = require("mongodb");
const {
  ORDER_MESSAGE,
} = require("../../controller-messages/snacks-messages/order.messages");
const { dateFormateAsDMY } = require("../../helpers/date-formatter");
const { ENUMS } = require("../../constants/enum.constants");

/* ADD NEW PROJECT Hours // METHOD: POST */
/* PAYLOAD: project_code, project_title, client_name, hours */
const addHours = async (req, res) => {
  try {
    const { hours_details } = req.body;
    const newHours = hours_details.map((element) => ({
      date: element.date,
      project_code: element.project_code,
      project_title: element.project_title,
      client_name: element.client_name,
      hours: element.hours,
    }));
    const addedHours = await Add_Hours.create(newHours);

    for (const { project_code, hours } of newHours) {
      await Project.findOneAndUpdate(
        { project_code },
        { $inc: { tracker_status: hours } }
      );
    }
    if (addedHours) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_ADDED,
        data: addedHours,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: ADD_HOURS_MESSAGES.HOURS_NOT_ADDED,
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

/* LIST ALL PROJECT HOURS // METHOD: POST // PAYLOAD: filter, search, sort, current_page, per_page */
const listHours = async (search, filter, empName, permissions) => {
  try {
    const d = new Date();

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
    const search_by = search ? search : "";
    const OrArrayForMatchOBJ = [
      { project_title: { $regex: `^${search_by}`, $options: "i" } },
      { project_code: { $regex: `^${search_by}`, $options: "i" } },
      { client_name: { $regex: `^${search_by}`, $options: "i" } },
    ];

    if (
      permissions &&
      permissions.find(
        (o) => o.name === ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT
      )
    ) {
      OrArrayForMatchOBJ.push({
        "emp_tracker.name": { $regex: `^${search_by}`, $options: "i" },
      });
    }

    let matchOBJ = {
      $or: OrArrayForMatchOBJ,
      converted_date: {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      },
      is_deleted: false,
    };

    if (empName) {
      matchOBJ = { ...matchOBJ, "emp_tracker.name": empName };
    }

    const hoursList = await Add_Hours.aggregate([
      {
        $addFields: {
          converted_date: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$date", 6, 4] },
                  "-",
                  { $substr: ["$date", 3, 2] },
                  "-",
                  { $substr: ["$date", 0, 2] },
                  "T00:00:00.000Z",
                ],
              },
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
            },
          },
        },
      },
      {
        $lookup: {
          from: EMP_HOURS,
          localField: "_id",
          foreignField: "hour_id",
          as: "emp_hours",
        },
      },
      {
        $addFields: {
          emp_tracker: {
            $cond: {
              if: { $eq: [{ $size: "$emp_hours" }, 1] },
              then: { $arrayElemAt: ["$emp_hours", 0] },
              else: {},
            },
          },
        },
      },
      {
        $match: matchOBJ,
      },
      {
        $lookup: {
          from: PROJECT,
          localField: "project_code",
          foreignField: "project_code",
          as: "project_data",
        },
      },
      {
        $addFields: {
          profile: {
            $ifNull: [{ $arrayElemAt: ["$project_data.profile", 0] }, "---"],
          },
        },
      },
      {
        $project: {
          project_data: 0,
        },
      },
      {
        $group: {
          _id: "$converted_date",
          total_hours: { $sum: "$hours" },
          data: { $push: "$$ROOT" },
          profile: { $first: "$profile" },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $project: {
          date: "$_id",
          total_hours: 1,
          data: 1,
          _id: 0,
        },
      },
    ]);
    let grand_total_hours = 0;
    let grand_total_emp = 0;
    let grand_total_emp_hours = 0;
    hoursList.forEach((item) => {
      grand_total_hours += item.total_hours;

      if (item.data.length) {
        grand_total_emp += item.data
          ?.map((u, i) => {
            let count = 0;
            if (u.emp_tracker?._id) {
              count += 1;
            }
            return count;
          })
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        grand_total_emp_hours += parseFloat(
          item.data
            ?.map((u, i) => {
              if (u.emp_tracker?._id !== undefined) {
                return u.emp_tracker?.number;
              }
            })
            .filter((o) => o !== undefined)
            .map((o) => parseFloat(o))
            .filter((o) => !isNaN(o))
            .reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0
            )
            .toFixed(2)
        );
      }
    });
    const date_range = {
      start: start_date.toISOString().split("T")[0],
      end: end_date.toISOString().split("T")[0],
    };

    const output = {
      grand_total_hours: grand_total_hours,
      date_range: date_range,
      grand_total_emp: grand_total_emp,
      grand_total_emp_hours: grand_total_emp_hours,
      hours_data: hoursList,
    };

    if (hoursList && hoursList.length > 0) {
      return { status: 1, result: output };
    } else {
      return { status: 0, result: [] };
    }
  } catch (error) {
    console.log("erorrrrrrrrrrrrrrrrrrrrrrrrrrrr", error);
    return { status: 0, error: 1 };
  }
};

/* ITEM WISE EVERYDAY REPORT BETWEEN DATES // METHOD: POST */
const Hour = async (req, res) => {
  try {
    const { search, e_name = "" } = req.body;
    const { permissions } = req[AUTH_USER_DETAILS];
    const filter = req.body.filter;
    let getHours = await listHours(search, filter, e_name, permissions);
    if (getHours.error) {
      throw new Error();
    }
    if (getHours.status) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_FOUND,
        data: getHours.result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_NOT_FOUND,
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

/* LIST PROJECT HOURS BY PROJRCT CODE // METHOD: POST // PAYLOAD: filter, project_code, search, sort, current_page, per_page */
const listProjectHours = async (req, res) => {
  try {
    const d = new Date();
    const { project_code, search } = req.body;
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
    const search_by = search ? search : "";

    const hoursList = await Add_Hours.aggregate([
      {
        $match: { project_code },
      },
      {
        $addFields: {
          converted_date: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$date", 6, 4] },
                  "-",
                  { $substr: ["$date", 3, 2] },
                  "-",
                  { $substr: ["$date", 0, 2] },
                  "T00:00:00.000Z",
                ],
              },
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
            },
          },
        },
      },
      {
        $lookup: {
          from: EMP_HOURS,
          localField: "_id",
          foreignField: "hour_id",
          as: "emp_hours",
        },
      },
      {
        $addFields: {
          emp_tracker: {
            $cond: {
              if: { $eq: [{ $size: "$emp_hours" }, 1] },
              then: { $arrayElemAt: ["$emp_hours", 0] },
              else: {},
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { "emp_tracker.name": { $regex: `^${search_by}`, $options: "i" } },
            { project_title: { $regex: `^${search_by}`, $options: "i" } },
            { project_code: { $regex: `^${search_by}`, $options: "i" } },
            { client_name: { $regex: `^${search_by}`, $options: "i" } },
          ],
          converted_date: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: PROJECT,
          localField: "project_code",
          foreignField: "project_code",
          as: "project_data",
        },
      },
      {
        $addFields: {
          profile: {
            $ifNull: [{ $arrayElemAt: ["$project_data.profile", 0] }, "---"],
          },
        },
      },
      {
        $project: {
          project_data: 0,
        },
      },
      {
        $group: {
          _id: "$converted_date",
          total_hours: { $sum: "$hours" },
          data: { $push: "$$ROOT" },
          profile: { $first: "$profile" },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $project: {
          date: "$_id",
          total_hours: 1,
          data: 1,
          _id: 0,
        },
      },
    ]);

    let grand_total_hours = 0;
    hoursList.forEach((item) => {
      grand_total_hours += item.total_hours;
    });

    const date_range = {
      start: start_date.toISOString().split("T")[0],
      end: end_date.toISOString().split("T")[0],
    };

    const output = {
      grand_total_hours: grand_total_hours,
      date_range: date_range,
      hours_data: hoursList,
    };

    if (output) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_FOUND,
        data: output,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_NOT_FOUND,
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

/* LIST PROJECT HOURS BY PROJRCT CODE // METHOD: POST // PAYLOAD: filter, project_code, search, sort, current_page, per_page */
const hourListForProject = async (req, res) => {
  try {
    const { project_code } = req.params;

    const hoursList = await Add_Hours.aggregate([
      {
        $match: { project_code },
      },
      {
        $addFields: {
          converted_date: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$date", 6, 4] },
                  "-",
                  { $substr: ["$date", 3, 2] },
                  "-",
                  { $substr: ["$date", 0, 2] },
                  "T00:00:00.000Z",
                ],
              },
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
            },
          },
        },
      },
      {
        $lookup: {
          from: EMP_HOURS,
          localField: "_id",
          foreignField: "hour_id",
          as: "emp_hours",
        },
      },
      {
        $addFields: {
          emp_tracker: {
            $cond: {
              if: { $eq: [{ $size: "$emp_hours" }, 1] },
              then: { $arrayElemAt: ["$emp_hours", 0] },
              else: {},
            },
          },
        },
      },
      {
        $lookup: {
          from: PROJECT,
          localField: "project_code",
          foreignField: "project_code",
          as: "project_data",
        },
      },
      {
        $addFields: {
          profile: {
            $ifNull: [{ $arrayElemAt: ["$project_data.profile", 0] }, "---"],
          },
          weekly_limit_summary: {
            $ifNull: [
              { $arrayElemAt: ["$project_data.weekly_limit_summary", 0] },
              "---",
            ],
          },
        },
      },
      {
        $project: {
          project_data: 0,
        },
      },
      {
        $sort: { converted_date: 1 },
      },
    ]);

    const today = getToday();
    const currentWeek = getCurrentWeekDates();
    const lastWeek = getPreviousWeekDates();

    function sumHoursInDateRange(data, startDate, endDate) {
      const filteredData = data.filter((item) => {
        const itemDate = new Date(item.converted_date);
        return itemDate >= startDate && itemDate <= endDate;
      });
      const sum = filteredData.reduce((total, item) => total + item.hours, 0);
      return sum;
    }

    const today_hours = sumHoursInDateRange(hoursList, today.start, today.end);
    const current_week_hours = sumHoursInDateRange(
      hoursList,
      currentWeek.start,
      currentWeek.end
    );
    const last_week_hours = sumHoursInDateRange(
      hoursList,
      lastWeek.start,
      lastWeek.end
    );
    let totalHours = 0;

    for (const entry of hoursList) {
      totalHours += entry.hours;
    }

    const output = {
      today: today_hours,
      current_week: current_week_hours,
      last_week: last_week_hours,
      since_start: totalHours,
      weekly_limit_summary: hoursList[0].weekly_limit_summary,
    };

    if (output) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_FOUND,
        data: output,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_NOT_FOUND,
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

/* GENERATE PDF OF TODAY'S ORDERS // METHOD: GET */
const generateAddHourPDF = async (req, res) => {
  try {
    const { search, e_name = "" } = req.body;
    const { permissions } = req[AUTH_USER_DETAILS];
    const filter = req.body.filter;
    let getHours = await listHours(search, filter, e_name, permissions);
    if (getHours.error) {
      throw new Error();
    }
    if (getHours.status) {
      let newArr = getHours.result;
      newArr.grand_total_hours = parseFloat(newArr.grand_total_hours).toFixed(
        2
      );
      newArr.hours_data.forEach((el) => {
        el.total_hours = parseFloat(el.total_hours).toFixed(2);
        el.date = dateFormateAsDMY(el.date);

        el.data.forEach((e) => {
          if (e.emp_tracker.name) {
            e.emp_tracker.name = e.emp_tracker.name;
            e.emp_tracker.number = e.emp_tracker.number;
          } else {
            e.emp_tracker.name = " ";
            e.emp_tracker.number = " ";
          }
        });
      });

      genratePdf("addHour", newArr)
        .then((pdf) => {
          if (pdf) {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ADD_HOURS_MESSAGES.PDF_EXPORTED,
              data: pdf.toString("base64"),
              error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
          } else {
            const responsePayload = {
              status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
              message: ADD_HOURS_MESSAGES.PDF_NOT_EXPORTED,
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
        error: ADD_HOURS_MESSAGES.HOURS_NOT_FOUND,
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

/* UPDATE PROJECT HOURS // METHOD: PUT in PARAMS: hour id */
/* PAYLOAD: project_code, project_title, client_name, hours */
const updateHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_code, project_title, client_name, hours } = req.body;

    if (project_code) {
      const project = await Project.findOne({ project_code: project_code });

      if (!project || project.project_code !== project_code) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: ADD_HOURS_MESSAGES.PROJECT_CODE_NOT_MATCH,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    const existingHours = await Add_Hours.findById(id);

    if (!existingHours) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }

    const hoursDifference = hours - existingHours.hours;

    const updatedHours = await Add_Hours.findByIdAndUpdate(
      id,
      {
        project_code: project_code,
        project_title: project_title,
        client_name: client_name,
        hours: hours,
        updated_by: id,
      },
      { new: true }
    );

    await Project.findOneAndUpdate(
      { project_code },
      { $inc: { tracker_status: hoursDifference } }
    );

    if (updatedHours) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_UPDATED,
        data: updatedHours,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: ADD_HOURS_MESSAGES.HOURS_NOT_UPDATED,
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

/* DELETE PROJECT HOURS // METHOD: DELETE in PARAMS: hour id */
const deleteHours = async (req, res) => {
  try {
    const { id } = req.params;

    const existingHours = await Add_Hours.findById(id);

    if (!existingHours) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: ADD_HOURS_MESSAGES.HOURS_NOT_FOUND,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }

    const deletedHours = await Add_Hours.findByIdAndUpdate(id, {
      $set: {
        is_deleted: true,
        deleted_by: id,
      },
    });
    await Project.findOneAndUpdate(
      { project_code: deletedHours.project_code },
      { $inc: { tracker_status: -deletedHours.hours } }
    );

    if (deletedHours) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_DELETED,
        data: deletedHours,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: ADD_HOURS_MESSAGES.HOURS_NOT_DELETED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (err) {
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

/* LIST PROJECT HOURS BY ID // METHOD: GET // PARAMS: hour id */
const listHoursById = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = new mongoose.Types.ObjectId(id);
    // const _id = new ObjectId(id);
    const listedHoursById = await Add_Hours.aggregate([
      {
        $match: {
          _id: _id,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: PROJECT,
          let: { p_code: "$project_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_code", "$$p_code"] },
              },
            },
            {
              $project: {
                profile: 1,
              },
            },
          ],
          as: "profile",
        },
      },
      {
        $addFields: {
          profile: { $arrayElemAt: ["$profile.profile", 0] },
        },
      },
    ]);
    if (listedHoursById) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_LISTED_SUCCESSFULLY,
        data: listedHoursById[0],
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: ADD_HOURS_MESSAGES.HOURS_NOT_LISTED,
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

module.exports = {
  addHours,
  // listHours,
  updateHours,
  deleteHours,
  listHoursById,
  Hour,
  generateAddHourPDF,
  listProjectHours,
  hourListForProject,
};
