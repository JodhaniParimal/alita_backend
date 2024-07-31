var { Router } = require("express");
const indexRouter = Router();

const { auth } = require("../middlewares/auth.guard");

const { authRouter } = require("./auth/auth.routes");
const { employeeRouter } = require("./employee/index");
const { roleRouter } = require("./role/index");
const { groupRouter } = require("./group/index");

const { allbehaviouralRouter } = require("./behaviouralSkillset/index");
const { projectIndex } = require("./project");
const { leadIndex } = require("./lead");
const { bidsIndex } = require("./bids");
const { dashboardIndex } = require("./dashboard");
const { tasksRouter } = require("./tasks");
const { technologyRouter } = require("./technology/technology.route");
const { profileRouter } = require("./auth/loggedinUser.routes");
const { platformRouter } = require("./platform/platform.route");
const { trackerRouter } = require("./tracker/tracker.route");
const { techsupportRouter } = require("./techsupport/techsupport.route");
const { departmentRouter } = require("./department/department.route");
const { clientRouter } = require("./client/client.route");
const { snacksRouter } = require("./snacks");
const { holidayRouter } = require("./holiday/holiday.route");
const { leaveRouter } = require("./leave/leave.route");
const { teamRouter } = require("./team_managment/team.managment.route");
const {
  activityEventRouter,
} = require("./logs/employee.activity.event.logs.route");
const { statusRouter } = require("./status/status.route");
const { workingDateRouter } = require("./working_date/working_date.route");

/* GET home page. */
indexRouter.get("/", function (req, res, next) {
  res.send("<h1 style='text-align:center'>Welcome to Alita tools</h1>");
});

indexRouter.use("/auth", authRouter);
indexRouter.use("/allstatus", statusRouter);
indexRouter.use("/tracker", trackerRouter);
indexRouter.use("/profile-view", profileRouter);
indexRouter.use("/employee", auth, employeeRouter);
indexRouter.use("/behaviouralSkillset", auth, allbehaviouralRouter);
indexRouter.use("/role", auth, roleRouter);
indexRouter.use("/group", auth, groupRouter);

indexRouter.use("/tasks", auth, tasksRouter);

indexRouter.use("/bids", auth, bidsIndex);
indexRouter.use("/lead", auth, leadIndex);
indexRouter.use("/", auth, projectIndex);
indexRouter.use("/dashboard", auth, dashboardIndex);

indexRouter.use("/technology", auth, technologyRouter);
indexRouter.use("/platform", auth, platformRouter);
indexRouter.use("/techsupport", auth, techsupportRouter);
indexRouter.use("/department", auth, departmentRouter);
indexRouter.use("/client", auth, clientRouter);
indexRouter.use("/team", auth, teamRouter);

indexRouter.use("/leave", auth, leaveRouter);
indexRouter.use("/holiday", auth, holidayRouter);
indexRouter.use("/working-date", auth, workingDateRouter);
indexRouter.use("/snacks", auth, snacksRouter);

indexRouter.use("/employee-activity-event", auth, activityEventRouter);

module.exports = { indexRouter };
