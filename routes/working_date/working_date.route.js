const { Router } = require("express");
const {
  addWorkingDay,
  disableWorkingDay,
} = require("../../controllers/working_date/working_date.controller");
const workingDateRouter = Router();

/* SAVE WORKING DATE*/
workingDateRouter.post(
  "/create",
  // authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_ADD]),
  addWorkingDay
);

/* REMOVE WORKING DATE*/
workingDateRouter.put(
  "/remove",
  // authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_ADD]),
  disableWorkingDay
);

// /* GET HOLIDAY BY ID*/
// holidayRouter.get(
//     "/get-holiday/:_id",
//     authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_UPDATE]),
//     getHolidayById
// );

// /* GET HOLIDAY DATE*/
// holidayRouter.get(
//     "/holiday-date",
//     // authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_VIEW]),
//     listHolidayDate
// );

// /* GET HOLIDAY LIST*/
// holidayRouter.post(
//     "/listholiday",
//     // authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_VIEW]),
//     listHoliday
// );

// /* UPDATE HOLIDAY*/
// holidayRouter.put(
//     "/update/:_id",
//     authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_UPDATE]),
//     updateHoliday
// );

// /* DELETE HOLIDAY {SOFT DELETE}*/
// holidayRouter.put(
//     "/delete/:_id",
//     authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_DELETE]),
//     deleteHoliday
// );

module.exports = {
  workingDateRouter,
};
