const bcrypt = require("bcryptjs");
const moment = require("moment");
const { ENUMS } = require("../constants/enum.constants");
const html_to_pdf = require("html-pdf-node");
const fs = require("fs");
const handlebars = require("handlebars");
const Team_managment = require("../models/team_managment/team.managment.model");
const Group = require("../models/group/group.model");
const Employee_Group = require("../models/group/employee.group.model");
const Employee = require("../models/employee/employee.model");
const saltRounds = process.env.SALT_ROUNDS;

const checkColumn = (
  model,
  field,
  value,
  successMsg,
  errorMsg,
  type,
  is_case_insensitive
) => {
  if (is_case_insensitive) {
    value = { $regex: `^${value}$`, $options: "i" };
  }
  return new Promise((resolve, reject) => {
    model
      .find({ [field]: value })
      .then((data) => {
        if (type == ENUMS.VALIDATION_TYPE.UNIQUE) {
          if (data.length <= 0) {
            resolve(successMsg);
          } else {
            reject(errorMsg);
          }
        } else if (type == ENUMS.VALIDATION_TYPE.EXISTS) {
          if (data.length > 0) {
            resolve(successMsg);
          } else {
            reject(errorMsg);
          }
        }
      })
      .catch((err) => {
        reject(errorMsg);
      });
  });
};

const passwordHash = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, parseInt(saltRounds), (err, hash) => {
      if (err) {
        return reject(err);
      }
      return resolve(hash);
    });
  });
};

const comparePasswordHash = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(password, hash)
      .then((isValid) => {
        if (isValid) return resolve(1);
        else return resolve(0);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

const padWithLeadingZeros = (num, totalLength) => {
  return String(num).padStart(totalLength, "0");
};

const getCurrentDate = () => {
  const timestamp = new Date();
  const dateObj = moment(timestamp).format("DD-MM-YYYY");
  return dateObj;
};

const groupBy = (arr, prop) => {
  var grouped = {};
  for (var i = 0; i < arr.length; i++) {
    var p = arr[i][prop];
    if (!grouped[p]) {
      grouped[p] = [];
    }
    grouped[p].push(arr[i]);
  }
  return grouped;
};

const getDates = (startDate, endDate) => {
  var dateArray = [];
  var currentDate = moment(startDate);
  var lastDate = moment(endDate);
  while (currentDate <= lastDate) {
    dateArray.push(moment(currentDate).format("YYYY-MM-DD"));
    currentDate = moment(currentDate).add(1, "days");
  }
  return dateArray;
};

const genratePdf = (filename, orderData) => {
  return new Promise((resolve, reject) => {
    let template;
    let html;
    if (filename == "addHour") {
      let templateSource = fs.readFileSync(`./views/${filename}.hbs`, {
        encoding: "utf8",
      });
      template = handlebars.compile(templateSource);
      html = template({ hours: orderData });
    } else {
      let templateSource = fs.readFileSync(`./views/reports/${filename}.hbs`, {
        encoding: "utf8",
      });
      template = handlebars.compile(templateSource);
      html = template({ orders: orderData });
    }

    let options = { format: "A4", printBackground: true };
    let file = { content: html };
    html_to_pdf
      .generatePdf(file, options)
      .then((pdf) => {
        resolve(pdf);
      })
      .catch((err) => reject(err));
  }).catch((err) => {
    throw new Error(err);
  });
};

const getToday = () => {
  const x = new Date();
  let start_date = new Date(x.setHours(x.getHours() - x.getHours()));
  let end_date = new Date(x.setDate(x.getDate() + 1));

  return { start: start_date, end: end_date };
};

const getCurrentWeekDates = () => {
  const z = new Date();
  var currentWeekStartDate = new Date(z);
  new Date(currentWeekStartDate.setDate(z.getDate() - z.getDay()));
  new Date(currentWeekStartDate.setHours(5, 30, 0, 0));

  var currentWeekEndDate = new Date(z);
  new Date(currentWeekEndDate.setHours(23, 59, 59, 999));

  return { start: currentWeekStartDate, end: currentWeekEndDate };
};

const getPreviousWeekDates = () => {
  const a = new Date();
  var previousWeekStartDate = new Date(a);
  new Date(previousWeekStartDate.setDate(a.getDate() - a.getDay() - 7));
  new Date(previousWeekStartDate.setHours(5, 30, 0, 0));

  var previousWeekEndDate = new Date(a);
  new Date(previousWeekEndDate.setDate(a.getDate() - a.getDay() - 1));
  new Date(previousWeekEndDate.setHours(23, 59, 59, 999));

  return { start: previousWeekStartDate, end: previousWeekEndDate };
};

const removeDuplicates = (arr) => {
  return Array.from(new Set(arr));
};

const getGroupEmailsByTitle = async (title) => {
  const group = await Group.findOne({ title: title }).select({ _id: 1 });

  let emp_group = await Employee_Group.find({ group_id: group._id }).select({
    _id: 0,
    employee_code: 1,
  });
  const codesArray = emp_group.map((item) => item.employee_code);

  const employeeEmails = await Employee.find({
    employee_code: { $in: codesArray },
  }).select({ _id: 0, email: 1 });
  const groupEmail = employeeEmails.map((item) => item.email);

  return groupEmail;
};

const getTeamLeaderEmails = async (team_lead) => {
  const teamLeaderEmails = await Promise.all(
    team_lead.map(async (item) => {
      const employee = await Employee.findOne({
        employee_code: item.team_leader,
      }).select({ _id: 0, email: 1 });
      return employee.email;
    })
  );
  return teamLeaderEmails;
};

function getDayOfWeek(dateString) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [dayStr, monthStr, yearStr] = dateString.split("-");

  const date = new Date(`${yearStr}-${monthStr}-${dayStr}`);

  const dayIndex = date.getDay();
  const day = days[dayIndex];

  return day;
}

function convertMinutes(minutes) {
  var [hours, minute] = minutes.split(".").map(Number);
  var percentageOfTotalMinutes = Math.round((minute * 100) / 60);
  return `${hours}.${percentageOfTotalMinutes}`;
}

function formatNumberToFixed(number) {
  if (number !== null && typeof number !== "undefined") {
    const roundedNumber = parseFloat(number);
    const fix100 = roundedNumber.toFixed(2);
    const x = fix100;
    // const x = convertMinutes(fix100);
    return x;
  }
  return "0.00";
}

function isWorkingDay(date) {
  const dayOfWeek = date.day();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

function getLastSaturdayOfMonth(date) {
  return date.clone().endOf("month").day(6);
}

function getWorkingDaysWithLastSaturday(startDate, endDate) {
  const workingDays = [];
  const currentDate = moment(startDate);
  const lastDate = moment(endDate);

  while (currentDate.isSameOrBefore(lastDate)) {
    if (isWorkingDay(currentDate)) {
      workingDays.push({
        date: currentDate.toISOString(),
        time: 8,
      });
    }

    currentDate.add(1, "day");
  }

  currentDate
    .year(moment(startDate).year())
    .month(moment(startDate).month())
    .date(1);

  while (currentDate.isSameOrBefore(lastDate)) {
    const lastSaturday = getLastSaturdayOfMonth(currentDate);

    if (
      lastSaturday.isSameOrBefore(lastDate) &&
      lastSaturday.isAfter(currentDate)
    ) {
      workingDays.push({
        date: lastSaturday.toISOString(),
        time: 4,
      });
    }

    currentDate.add(1, "month");
  }

  return workingDays;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// const getAllTeamMembers = async (team_leader) => {
//   const teamMembers = [team_leader];
//   const visitedEmployees = new Set();

//   const findTeamMembers = async (employeeCode) => {
//     if (!visitedEmployees.has(employeeCode)) {
//       visitedEmployees.add(employeeCode);
//       const employee = await Team_managment.findOne({ team_leader: employeeCode });

//       if (employee && employee.team_member && employee.team_member.length > 0) {
//         for (const member of employee.team_member) {
//           teamMembers.push(member);
//           await findTeamMembers(member);
//         }
//       }
//     }
//   };

//   await findTeamMembers(team_leader);
//   return teamMembers;
// };

module.exports = {
  checkColumn,
  passwordHash,
  comparePasswordHash,
  padWithLeadingZeros,
  getCurrentDate,
  groupBy,
  getDates,
  genratePdf,
  getToday,
  getCurrentWeekDates,
  getPreviousWeekDates,
  removeDuplicates,
  getGroupEmailsByTitle,
  getTeamLeaderEmails,
  getDayOfWeek,
  convertMinutes,
  formatNumberToFixed,
  getWorkingDaysWithLastSaturday,
  formatDate,
  // getAllTeamMembers
};
