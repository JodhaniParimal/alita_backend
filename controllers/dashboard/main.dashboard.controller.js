const { days } = require("../../constants/dayNames.constants");
const { ENUMS } = require("../../constants/enum.constants");
const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");
const { EMPLOYEE } = require("../../constants/models.enum.constants");
const {
  EMPLOYEE_MESSAGE,
} = require("../../controller-messages/employee-messages/employee.messages");
const Employee = require("../../models/employee/employee.model");
const Leave = require("../../models/leave/leave.model");

// LIST EMPLOYEE BIRTHDAY
const listEmployeeBirthday = async (req, res) => {
  try {
    const result = await Employee.find({ is_deleted: false })
      .select({
        _id: 0,
        employee_code: 1,
        date_of_birth: 1,
        firstname: 1,
        lastname: 1,
        profile_pic: 1,
      })
      .lean();

    const today = new Date();
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1;
    const currentDate = today.getUTCDate();
    const currentDayOfWeek = today.getUTCDay();

    const todayBirthday = [];
    const comingBirthday = [];

    const upcomingSunday = new Date(today);
    upcomingSunday.setDate(currentDate + (7 - currentDayOfWeek));
    const currentweekYear = upcomingSunday.getUTCFullYear();
    const currentweekDate = upcomingSunday.getUTCDate();
    const currentweekMonth = upcomingSunday.getUTCMonth() + 1;

    result.forEach((employee) => {
      const employeeDate = new Date(employee.date_of_birth);
      const x = employeeDate;

      if (currentMonth == 12 && currentweekMonth == 1) {
        if (employeeDate.getUTCMonth() + 1 === 12) {
          x.setFullYear(currentYear);
        } else {
          x.setFullYear(currentweekYear);
        }
      } else {
        x.setFullYear(currentYear);
      }

      const dayName = days[x.getDay()];
      const employeeMonth = employeeDate.getUTCMonth() + 1;
      const employeeDay = employeeDate.getUTCDate();

      const fullName = `${employee.firstname} ${employee.lastname}`;

      if (employeeMonth === currentMonth && employeeDay === currentDate) {
        todayBirthday.push({
          ...employee,
          full_name: fullName,
          dayName: dayName,
        });
      } else {
        if (
          currentMonth + 1 == currentweekMonth ||
          (currentMonth == 12 && currentweekMonth == 1)
        ) {
          if (
            (employeeMonth === currentMonth &&
              employeeDay > currentDate &&
              employeeDay <= 31) ||
            (employeeMonth === currentweekMonth &&
              employeeDay >= 1 &&
              employeeDay <= currentweekDate)
          ) {
            comingBirthday.push({
              ...employee,
              full_name: fullName,
              dayName: dayName,
            });
          }
        } else if (currentMonth == currentweekMonth) {
          if (
            employeeMonth === currentMonth &&
            employeeDay > currentDate &&
            employeeDay <= currentweekDate
          ) {
            comingBirthday.push({
              ...employee,
              full_name: fullName,
              dayName: dayName,
            });
          }
        }
      }
    });

    const todayBirthdayWithoutNames = todayBirthday.map(
      ({ firstname, lastname, ...rest }) => rest
    );
    const comingBirthdayWithoutNames = comingBirthday.map(
      ({ firstname, lastname, ...rest }) => rest
    );

    const resultObject = {
      today_birthday: todayBirthdayWithoutNames,
      coming_birthday: comingBirthdayWithoutNames,
    };

    if (resultObject) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_BIRTHDAY_FOUND,
        data: resultObject,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_BIRTHDAY_NOT_FOUND,
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

// LIST EMPLOYEE LEAVE FOR DASHBOARD
const listEmployeeLeaveDashBoard = async (req, res) => {
  try {
    const result = await Leave.aggregate([
      {
        $match: {
          is_deleted: false,
          leave_status: ENUMS.LEAVE_STATUS.APPROVE,
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
            { $project: { _id: 0, firstname: 1, lastname: 1, profile_pic: 1 } },
          ],
          as: "employee_name",
        },
      },
      {
        $addFields: {
          full_name: {
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
        $addFields: {
          leave_date: {
            $toDate: "$leave_date",
          },
        },
      },
      {
        $project: {
          _id: 0,
          employee_code: 1,
          leave_date: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$leave_date",
            },
          },
          full_name: 1,
          leave_category: 1,
          from: 1,
          to: 1,
          profile_pic: {
            $ifNull: [
              { $arrayElemAt: ["$employee_name.profile_pic", 0] },
              null,
            ],
          },
        },
      },
    ]);

    const today = new Date();
    let x = new Date();
    x.setHours(23, 59, 59);
    const currentTime = Date.parse(x);

    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1;
    const currentDate = today.getUTCDate();
    const currentDayOfWeek = today.getUTCDay();

    const todayLeave = [];
    const comingLeave = [];

    const upcomingSunday = new Date(today);
    upcomingSunday.setDate(currentDate + (7 - currentDayOfWeek));
    let z = upcomingSunday;
    z.setHours(23, 59, 59);
    const currentWeekTime = Date.parse(z);

    result.forEach((leave) => {
      const employeeLeaveDate = new Date(leave.leave_date);
      const leaveDate = Date.parse(employeeLeaveDate);

      const dayName = days[employeeLeaveDate.getDay()];
      const employeeLeaveYear = employeeLeaveDate.getUTCFullYear();
      const employeeLeaveMonth = employeeLeaveDate.getUTCMonth() + 1;
      const employeeLeaveDay = employeeLeaveDate.getUTCDate();

      if (
        employeeLeaveYear === currentYear &&
        employeeLeaveMonth === currentMonth &&
        employeeLeaveDay === currentDate
      ) {
        todayLeave.push({ ...leave, dayName: dayName });
      } else {
        if (leaveDate > currentTime && leaveDate <= currentWeekTime) {
          comingLeave.push({ ...leave, dayName: dayName });
        }
      }
    });

    const resultObject = {
      today_leave: todayLeave,
      coming_leave: comingLeave,
    };

    if (resultObject) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_LEAVE_FOUND,
        data: resultObject,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: EMPLOYEE_MESSAGE.EMPLOYEE_LEAVE_NOT_FOUND,
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
  listEmployeeBirthday,
  listEmployeeLeaveDashBoard,
};
