const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Employee = require("../models/employee/employee.model");
const { ENUMS } = require("../constants/enum.constants");
const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_AUTHORIZATION_ERROR,
  RESPONSE_STATUS_MESSAGE_AUTHORIZATION_ERROR,
  RESPONSE_STATUS_MESSAGE_PERMISSION_AUTHORIZATION_ERROR,
  AUTH_USER_DETAILS,
  RESPONSE_STATUS_CODE_PERMISSION_AUTHORIZATION_ERROR,
} = require("../constants/global.constants");
const {
  listEmployeeGroupsForAll,
} = require("../controllers/group/employee.group.controller");
const { Sockets } = require("../models/socket/socket.model");
const Team_managment = require("../models/team_managment/team.managment.model");
const Employee_Group = require("../models/group/employee.group.model");
const Group = require("../models/group/group.model");
dotenv.config();

/** Authorization middleware to check */
const 
auth = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const authArray = req.headers.authorization.split(" ");
      if (authArray && authArray.length > 0 && authArray[1]) {
        const token = authArray[1];
        const secret_key = process.env.SECRET_KEY;
        const decodedToken = jwt.verify(token, secret_key);

        let findObj = {
          _id: decodedToken.id,
          email: decodedToken.email,
          status: ENUMS.EMPLOYEE_STATUS.STATUS_ACTIVE,
        };
        if (req.headers["ttx_login_type"] === "tracker") {
          findObj = { ...findObj, tracker_token: token };
        } else {
          findObj = { ...findObj, token: token };
        }
        const userObj = await Employee.findOne(findObj).populate({
          path: "role_id",
          select: { role: 1 },
        });
        if (userObj) {
          const user = userObj.toJSON();
          user.role = user.role_id.role;

          (user.permissions = []), (user.group = "");
          let empPermissions = await listEmployeeGroupsForAll(
            user.employee_code
          );
          if (empPermissions.status) {
            user.permissions = empPermissions.result.permissions;
            user.group = empPermissions.result.groups.title;
          }

          let socketDetails = await Sockets.findOne({
            employee_code: user.employee_code,
            is_deleted: false,
          });
          user.socket_id = socketDetails ? socketDetails.socket_id : "";
          const group_id = await Employee_Group.findOne({
            employee_code: user.employee_code,
          }).select({ _id: 0, group_id: 1 });
          const group = await Group.findOne({ _id: group_id.group_id }).select({
            _id: 0,
            title: 1,
          });

          const x = empPermissions.result.permissions.filter(
            (o) => o.name === ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT
          );

          const { employee_code: team_leader } = user;
          let teamMembers = [];
          if (x.length || group.title === "HR manager") {
            const allEmployee = await Employee.find({
              is_deleted: false,
            }).select({ _id: 0, employee_code: 1 });
            const employeeCodes = allEmployee.map(
              (employee) => employee.employee_code
            );
            teamMembers = employeeCodes;
          } else {
            teamMembers = [team_leader];

            const visitedEmployees = new Set();

            const findTeamMembers = async (employeeCode) => {
              if (!visitedEmployees.has(employeeCode)) {
                visitedEmployees.add(employeeCode);
                const employee = await Team_managment.findOne({
                  team_leader: employeeCode,
                });

                if (
                  employee &&
                  employee.team_member &&
                  employee.team_member.length > 0
                ) {
                  for (const member of employee.team_member) {
                    teamMembers.push(member);
                    await findTeamMembers(member);
                  }
                }
              }
            };

            await findTeamMembers(team_leader);
          }
          user.teamMembers = teamMembers;

          req[AUTH_USER_DETAILS] = user;
          return next();
        } else {
          const responsePayload = {
            status: RESPONSE_PAYLOAD_STATUS_ERROR,
            message: null,
            data: null,
            error: RESPONSE_STATUS_MESSAGE_AUTHORIZATION_ERROR,
          };
          return res
            .status(RESPONSE_STATUS_CODE_AUTHORIZATION_ERROR)
            .json(responsePayload);
        }
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: RESPONSE_STATUS_MESSAGE_AUTHORIZATION_ERROR,
        };
        return res
          .status(RESPONSE_STATUS_CODE_AUTHORIZATION_ERROR)
          .json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: RESPONSE_STATUS_MESSAGE_AUTHORIZATION_ERROR,
      };
      return res
        .status(RESPONSE_STATUS_CODE_AUTHORIZATION_ERROR)
        .json(responsePayload);
    }
  } catch (err) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_AUTHORIZATION_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_AUTHORIZATION_ERROR)
      .json(responsePayload);
  }
};
/** Authorization middleware to check login user has right to access module or not */
const authPermissions = function (resource) {
  return async (req, res, next) => {
    try {
      const { permissions, group } = req[AUTH_USER_DETAILS];

      if (
        permissions.some((e) => resource.includes(e.name)) ||
        group == "admin"
      ) {
        return next();
      } else {
        const responsePayload = {
          message: null,
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          data: null,
          error: RESPONSE_STATUS_MESSAGE_PERMISSION_AUTHORIZATION_ERROR,
        };
        return res
          .status(RESPONSE_STATUS_CODE_PERMISSION_AUTHORIZATION_ERROR)
          .json(responsePayload);
      }
    } catch (error) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: RESPONSE_STATUS_MESSAGE_PERMISSION_AUTHORIZATION_ERROR,
      };
      return res
        .status(RESPONSE_STATUS_CODE_PERMISSION_AUTHORIZATION_ERROR)
        .json(responsePayload);
    }
  };
};
/** Authorization middleware to check login user has right to access module or not */
const allLeavePermissionChecker = async (req, res, next) => {
  try {
    const { permissions, teamMembers: members } = req[AUTH_USER_DETAILS];
    const user = req[AUTH_USER_DETAILS];
    let teamMembers = [...members];
    if (permissions.includes(ENUMS.PERMISSION_TYPE.ALL_LEAVE)){
      const allEmployee = await Employee.find({
        is_deleted: false,
      }).select({ _id: 0, employee_code: 1 });
      const employeeCodes = allEmployee.map(
        (employee) => employee.employee_code
      );
      teamMembers = employeeCodes;
    }
    user.teamMembers = teamMembers;
    return next();
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_PERMISSION_AUTHORIZATION_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_PERMISSION_AUTHORIZATION_ERROR)
      .json(responsePayload);
  }
};
/** Authorization middleware to check */
const itSupportAllEmployee = async (req, res, next) => {
  try {
    const { group, teamMembers: members } = req[AUTH_USER_DETAILS];
    const user = req[AUTH_USER_DETAILS];
    let teamMembers = [...members];
    if (group === "it_support") {
      const allEmployee = await Employee.find({
        is_deleted: false,
      }).select({ _id: 0, employee_code: 1 });
      const employeeCodes = allEmployee.map(
        (employee) => employee.employee_code
      );
      teamMembers = employeeCodes;
    }
    user.teamMembers = teamMembers;
    return next();
  } catch (err) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_AUTHORIZATION_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_AUTHORIZATION_ERROR)
      .json(responsePayload);
  }
};

module.exports = {
  auth,
  authPermissions,
  itSupportAllEmployee,
  allLeavePermissionChecker
};
