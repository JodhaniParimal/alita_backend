const express = require("express");
const {
  addTime,
  updateTime,
  trackerListingAsPerEmployee,
  trackerScreenshot,
  allEmployeeTrackerListing,
  listScreenshot,
  updateUploadStatus,
  addtrackerScreenshot,
  googleDriveUpload,
} = require("../../controllers/tracker/tracker.controller");
const { uploadScreenshot } = require("../../services/fileUpload");
const { auth, authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

const trackerRouter = new express.Router();

/* LIST TRACKER BY EMPLOYEE_CODE*/
trackerRouter.post("/list/:employee_code", auth, trackerListingAsPerEmployee);

/* LIST ALL EMPLOYEE TRACKER */
trackerRouter.post(
  "/list-alltracker",
  auth,
  // authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_VIEW]),
  authPermissions([ENUMS.PERMISSION_TYPE.TRACKER_EMPLOYEE_VIEW]),
  allEmployeeTrackerListing
);

/* ADD TRACKER*/
trackerRouter.post("/add", auth, addTime);

/* UPDATE TRACKER*/
trackerRouter.put("/update/:id", auth, updateTime);

// /* ADD TRACKER SCREENSHOT*/
// trackerRouter.post('/add-screenshot', trackerScreenshot)

/* ADD TRACKER SCREENSHOT IN PUBLIC FOLDER*/
trackerRouter.post('/add-screenshot', auth, uploadScreenshot.single("file"), addtrackerScreenshot)

/* GET TRACKER SCREENSHOT*/
trackerRouter.get("/get-screenshot", listScreenshot);

/* UPDATE TRACKER SCREENSHOT STATUS*/
trackerRouter.put("/update-screenshot/:id", updateUploadStatus);

module.exports = { trackerRouter };
