const cron = require("node-cron");
const Employee = require("../models/employee/employee.model");
const { dumpMongo2Localfile } = require("../helpers/dataBackUp.script");
const {
  Screenshot,
} = require("../models/trackerscreenshot/trackerscreenshot.model");
const Leave = require("../models/leave/leave.model");
const { ENUMS } = require("../constants/enum.constants");
const {
  LEAD_COMMENTS,
  EMPLOYEE,
  ROLE,
  SUMMARIES,
} = require("../constants/models.enum.constants");
const { Lead } = require("../models/lead/lead.model");
const { getWorkingDaysWithLastSaturday, formatDate } = require("../helpers/fn");
const Working_date = require("../models/working_date/working_date.model");

cron.schedule("10 0 * * *", async () => {
  try {
    await Employee.updateMany(
      { tracker_token: { $ne: null }, is_deleted: false },
      { tracker_token: null, updated_by: "Cron Job" },
      { new: true }
    );
    await dumpMongo2Localfile();

    console.log("Data Dump has been made");
  } catch (error) {
    console.error(
      "Data Dump faced some error ===============>>>>>>>>>>",
      error
    );
  }
});

// Screenshot Delete CRON JOB
cron.schedule("30 0 * * *", async () => {
  try {
    await Screenshot.deleteMany({ image_uploaded: true });

    console.log("Screenshot deleted");
  } catch (error) {
    console.error(
      "Screenshot delete faced some error ===============>>>>>>>>>>",
      error
    );
  }
});

// Leave Status Update For Not approve Leave
cron.schedule("20 0 * * *", async () => {
  try {
    const twoDaysAgo = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);
    twoDaysAgo.setHours(5, 30, 0, 0);

    const pendingLeaves = await Leave.aggregate([
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
          leave_status: ENUMS.LEAVE_STATUS.PENDING,
          new_leave_date: {
            $eq: twoDaysAgo,
          },
        },
      },
    ]);

    const updatePromises = pendingLeaves.map(async (leave) => {
      return Leave.updateOne(
        { _id: leave._id },
        { $set: { leave_status: ENUMS.LEAVE_STATUS.UNAPPROVE } }
      );
    });

    await Promise.all(updatePromises);

    console.log("Leave statuses updated.");
  } catch (error) {
    console.error(
      "Leave statuses update faced some error ===============>>>>>>>>>>",
      error
    );
  }
});

// Lead Status Update For Open Lead
cron.schedule("58 11 * * *", async () => {
  try {
    const twoDaysAgo = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);
    twoDaysAgo.setHours(5, 30, 0, 0);

    let openLead = await Lead.aggregate([
      {
        $match: { status: ENUMS.LEAD_STATUS.LEAD_STATUS_OPEN },
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

                      role: { $arrayElemAt: ["$role.role", 0] },
                    },
                  },
                ],
                as: "employee_name",
              },
            },
            {
              $addFields: {
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
        },
      },
      {
        $addFields: {
          summaries: {
            $cond: {
              if: { $eq: [{ $size: "$tl_last_reply_date" }, 0] },
              then: null,
              else: { $arrayElemAt: ["$tl_reply.summaries.createdAt", 0] },
            },
          },
          tl_last_reply_date: {
            $cond: {
              if: { $gt: [{ $size: "$tl_last_reply_date" }, 0] },
              then: { $arrayElemAt: ["$tl_last_reply_date.createdAt", 0] },
              else: null,
            },
          },
        },
      },
      {
        $unwind: {
          path: "$summaries",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { tl_last_reply_date: null },
                {
                  $expr: {
                    $eq: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$createdAt",
                        },
                      },
                      {
                        $dateToString: { format: "%Y-%m-%d", date: twoDaysAgo },
                      },
                    ],
                  },
                },
              ],
            },
            {
              $and: [
                { tl_last_reply_date: { $ne: null } },
                {
                  $or: [
                    {
                      $expr: {
                        $eq: [
                          {
                            $dateToString: {
                              format: "%Y-%m-%d",
                              date: "$summaries",
                            },
                          },
                          {
                            $dateToString: {
                              format: "%Y-%m-%d",
                              date: twoDaysAgo,
                            },
                          },
                        ],
                      },
                    },
                    {
                      $and: [
                        { summaries: null },
                        {
                          $expr: {
                            $eq: [
                              {
                                $dateToString: {
                                  format: "%Y-%m-%d",
                                  date: "$tl_last_reply_date",
                                },
                              },
                              {
                                $dateToString: {
                                  format: "%Y-%m-%d",
                                  date: twoDaysAgo,
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: "$_id",
          lead_code: { $first: "$lead_code" },
          project_name: { $first: "$project_name" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          tl_last_reply_date: { $first: "$tl_last_reply_date" },
          summaries: {
            $first: "$summaries",
          },
        },
      },
    ]);

    const updatePromises = openLead.map(async (lead) => {
      return Lead.updateOne(
        { _id: lead._id },
        { $set: { status: ENUMS.LEAD_STATUS.LEAD_STATUS_FOLLOW_UP } }
      );
    });

    await Promise.all(updatePromises);

    console.log("Lead statuses updated.");
  } catch (error) {
    console.error(
      "Lead statuses update faced some error ===============>>>>>>>>>>",
      error
    );
  }
});

// // Add working date on every year 1-12
// cron.schedule("0 5 1 12 *", async () => {
//   // cron.schedule("5 16 * * *", async () => {
//   try {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     // const currentYear = 2022;

//     const dateStart = new Date(currentYear + 1, 0, 1);
//     dateStart.setHours(6, 0, 0, 0);

//     const dateEnd = new Date(currentYear + 1, 11, 31);
//     dateEnd.setHours(18, 30, 0, 0);

//     var workingDaysList = getWorkingDaysWithLastSaturday(dateStart, dateEnd);

//     const workingDay = workingDaysList.map((element) => ({
//       working_date: element.date,
//       daily_time: element.time,
//     }));

//     const addWorkingDay = await Working_date.create(workingDay);

//     if (addWorkingDay) {
//       console.log("Working date data added successfully");
//     } else {
//       console.log("Working date data not added");
//     }
//   } catch (error) {
//     console.error(
//       "Working day adding faced some error ===============>>>>>>>>>>",
//       error
//     );
//   }
// });

// // Delete working date on every year 1-2
// cron.schedule("0 5 1 2 *", async () => {
//   // cron.schedule("46 15 * * *", async () => {
//   try {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();

//     const prevYearStartDate = new Date(currentYear - 1, 0, 1);
//     prevYearStartDate.setHours(6, 0, 0, 0);

//     const prevYearEndDate = new Date(currentYear - 1, 11, 31);
//     prevYearEndDate.setHours(18, 30, 0, 0);

//     const deleteWorkingDay = await Working_date.deleteMany({
//       working_date: {
//         $gte: new Date(prevYearStartDate),
//         $lt: new Date(prevYearEndDate),
//       },
//     });

//     if (deleteWorkingDay) {
//       console.log("Working date data delete successfully");
//     } else {
//       console.log("Working date data not deleted");
//     }
//   } catch (error) {
//     console.error(
//       "Working day adding faced some error ===============>>>>>>>>>>",
//       error
//     );
//   }
// });
