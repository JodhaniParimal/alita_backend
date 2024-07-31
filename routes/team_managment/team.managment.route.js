const { Router } = require("express");
const {
  addTeam,
  getOneTeam,
  deleteTeamHard,
  teamCount,
  listTeamsByEmployeeCode,
  listTeams,
} = require("../../controllers/team_managment/team.managment.controller");
const { ENUMS } = require("../../constants/enum.constants");
const { authPermissions } = require("../../middlewares/auth.guard");

const teamRouter = Router();

// ADD Team
teamRouter.post(
  "/create",
  authPermissions([
    ENUMS.PERMISSION_TYPE.TEAM_ADD,
    ENUMS.PERMISSION_TYPE.TEAM_UPDATE,
  ]),
  addTeam
);

// Team Count
teamRouter.get(
  "/team-count",
  authPermissions([ENUMS.PERMISSION_TYPE.TEAM_VIEW]),
  teamCount
);

// List Teams By employee_code
teamRouter.post(
  "/list-team-employee_code",
  authPermissions([ENUMS.PERMISSION_TYPE.TEAM_VIEW]),
  listTeamsByEmployeeCode
);

// List Teams
teamRouter.post(
  "/list-teams",
  // authPermissions([ENUMS.PERMISSION_TYPE.TEAM_VIEW]),
  listTeams
);

// GET Team By Id
teamRouter.get("/get/:id", getOneTeam);

// DELETE Team By Id
teamRouter.delete(
  "/delete/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.TEAM_DELETE]),
  deleteTeamHard
);

module.exports = {
  teamRouter,
};
