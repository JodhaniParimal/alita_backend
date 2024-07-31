const { Router } = require("express");
const {
    addHoliday,
    deleteHoliday,
    updateHoliday,
    getHolidayById,
    listHoliday,
    listHolidayDate
} = require("../../controllers/holiday/holiday.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const holidayRouter = Router();


/* ADD HOLIDAY*/
holidayRouter.post(
    "/create",
    authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_ADD]),
    addHoliday
);

/* GET HOLIDAY BY ID*/
holidayRouter.get(
    "/get-holiday/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_UPDATE]),
    getHolidayById
);

/* GET HOLIDAY DATE*/
holidayRouter.get(
    "/holiday-date",
    // authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_VIEW]),
    listHolidayDate
);

/* GET HOLIDAY LIST*/
holidayRouter.post(
    "/listholiday",
    // authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_VIEW]),
    listHoliday
);

/* UPDATE HOLIDAY*/
holidayRouter.put(
    "/update/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_UPDATE]),
    updateHoliday
);

/* DELETE HOLIDAY {SOFT DELETE}*/
holidayRouter.put(
    "/delete/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.HOLIDAY_DELETE]),
    deleteHoliday
);

module.exports = {
    holidayRouter,
};
