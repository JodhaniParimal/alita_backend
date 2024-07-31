const { Router } = require("express");
const {
  todaysOrderReport,
  foodReportOfEmployees,
  dateWiseMonthlyOrderReport,
  employeeWiseMonthlyOrderReport,
  monthlyDayWiseOrderReport,
  generatePDFOfTodaysOrderReport,
  generatePDFOfFoodReport,
  generatePDFOfdateWiseMonthlyOrderReport,
  generatePDFOfEmployeeWiseMonthlyOrderReport,
  generatePDFOfMonthlyDayWiseOrderReport,
} = require("../../../controllers/snacks/orders/report.controller");
const { authPermissions } = require("../../../middlewares/auth.guard");
const { ENUMS } = require("../../../constants/enum.constants");

const reportRouter = Router();

/* GET ALL TODAY'S ORDERS */
reportRouter.get(
  "/todays-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_VIEW]),
  todaysOrderReport
);

/* GENERATE PDF OF TODAY'S ORDERS */
reportRouter.get(
  "/generate-pdf-todays-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_DOWNLOAD]),
  generatePDFOfTodaysOrderReport
);

/* ITEM WISE EVERYDAY REPORT BETWEEN DATES */
reportRouter.post(
  "/food-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_VIEW]),
  foodReportOfEmployees
);

/* GENERATE PDF OF FOOD ORDERS */
reportRouter.post(
  "/generate-pdf-food-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_DOWNLOAD]),
  generatePDFOfFoodReport
);

/* TOTAL ORDER AMOUNT OF PARTICULAR MONTH OF YEAR */
reportRouter.post(
  "/date-wise-monthly-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_VIEW]),
  dateWiseMonthlyOrderReport
);

/* GENERATE PDF OF TOTAL ORDER AMOUNT OF PARTICULAR MONTH OF YEAR */
reportRouter.post(
  "/generate-pdf-monthly-orders",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_DOWNLOAD]),
  generatePDFOfdateWiseMonthlyOrderReport
);

/* TOTAL ORDER AMOUNT OF PARTICULAR EMPLOYEE OF MONTH OF YEAR */
reportRouter.post(
  "/employee-wise-monthly-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_VIEW]),
  employeeWiseMonthlyOrderReport
);

/* GENERATE PDF OF TOTAL ORDER AMOUNT OF PARTICULAR EMPLOYEE OF MONTH OF YEAR */
reportRouter.post(
  "/generate-pdf-employee-wise-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_DOWNLOAD]),
  generatePDFOfEmployeeWiseMonthlyOrderReport
);

/* GET MONTHLY DAY WISE ORDERS */
reportRouter.post(
  "/monthly-day-wise-order-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_VIEW]),
  monthlyDayWiseOrderReport
);

/* GENERATE PDF OF MONTHLY DAY WISE ORDERS */
reportRouter.post(
  "/generate-pdf-monthly-day-reports",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_REPORT_DOWNLOAD]),
  generatePDFOfMonthlyDayWiseOrderReport
);

module.exports = {
  reportRouter,
};
