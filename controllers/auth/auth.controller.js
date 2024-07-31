const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
} = require("../../constants/global.constants");
const { passwordHash, comparePasswordHash } = require("../../helpers/fn");

const {
  forgotPasswordMailer,
} = require("../../services/mailer/forgotPasswordMailTemplate");

const { AUTH_MESSAGES } = require("../../controller-messages/auth.messages");

const Employee = require("../../models/employee/employee.model");
const authService = require("../../services/auth.service");
const {
  listEmployeeGroupsForAll,
} = require("../group/employee.group.controller");
const Roles = require("../../models/role/role.model");
const Department = require("../../models/department/department.model");
const Holiday = require("../../models/holiday/holiday.model");
const { Settings } = require("../../models/settings/settings.model");
var md5 = require("md5");
const { Sockets } = require("../../models/socket/socket.model");
const Team_managment = require("../../models/team_managment/team.managment.model");

/* LOGIN // METHOD: POST // PAYLOAD: {email, password} */
const login = async (req, res) => {
  try {
    let { email, password } = req.body; //Coming from formData
    let existingUser = await Employee.findOne({
      email: { $regex: email, $options: "i" },
      is_deleted:false
    });
    if (!existingUser) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.INVALID_CREDENTIALS,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
    if (
      req.headers["ttx_login_type"] === "tracker" &&
      existingUser.tracker_token !== null
    ) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: { token: existingUser.tracker_token },
        error: AUTH_MESSAGES.USER_ALREADY_LOGGEDIN,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
    const isPasswordCorrect = await comparePasswordHash(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      const pass = md5(password);
      let setting = await Settings.findOne({ master_password: pass });
      if (!setting) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: AUTH_MESSAGES.INVALID_CREDENTIALS,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }

    //If crednetials are valid, create a token for the user
    const token = authService.generateToken({
      email: existingUser.email,
      id: existingUser._id,
      status: existingUser.status,
    });
    let updateObj = { token: token, last_login: new Date() };
    if (req.headers["ttx_login_type"] === "tracker") {
      updateObj = { tracker_token: token, last_tracker_login: new Date() };
    }
    let newRes = await Employee.findOneAndUpdate(
      { email: existingUser.email },
      updateObj,
      { new: true }
    );

    newRes = JSON.parse(JSON.stringify(newRes));

    delete newRes.password, delete newRes.token;

    const designation = await Roles.findById(newRes.role_id).select({
      _id: 0,
      role: 1,
    });
    if (designation) {
      newRes["role"] = designation.role;
    }

    const holidayDate = await Holiday.find({ is_deleted: false }).select({
      _id: 0,
      holiday_date: 1
    })
    if (holidayDate) {
      newRes.holidayDate = holidayDate.map((o) => o.holiday_date);
    }

    const teamMember = await Team_managment.find({ team_leader: newRes.employee_code }).select({
      _id: 0,
      team_member: 1
    })
    if (teamMember && teamMember.length > 0) {
      newRes.team_member = teamMember.map((member) => member.team_member).flat();
    } else {
      newRes.team_member = [];
    }
    
    const department = await Department.findById(newRes.department_id).select({
      _id: 0,
      title: 1,
    });
    if (department) {
      newRes["department"] = department.title;
    }
    (newRes.permissions = []), (newRes.group = "");
    let empPermissions = await listEmployeeGroupsForAll(newRes.employee_code);
    if (empPermissions.status) {
      newRes.group = empPermissions.result.groups.title;
      newRes.permissions = empPermissions.result.permissions;
    }

    const socket = req.app.get("socket");

    if (socket) {
      let socketDetails = await Sockets.findOne({
        employee_code: newRes.employee_code,
        is_deleted: false,
      });

      if (socketDetails) {
        await Sockets.findOneAndUpdate(
          { employee_code: newRes.employee_code, is_deleted: false },
          { socket_id: socket.id, updated_by: newRes.employee_code }
        );
      } else {
        await Sockets.create({
          socket_id: socket.id,
          employee_code: newRes.employee_code,
          created_by: newRes.employee_code,
        });
      }

      newRes.socket_id = socket.id;
    }

    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: AUTH_MESSAGES.LOGIN_SUCCESSFUL,
      data: { token: token, result: newRes },
      error: null,
    };
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
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

/* FORGOT PASSWORD // METHOD: POST // PAYLOAD: {email} */
const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    const empObj = await Employee.findOne({
      email: { $regex: email, $options: "i" },
    });
    const emp = empObj.toJSON();
    const token = authService.generateTokenForgotPassword(emp.email, emp.id);

    let result = await forgotPasswordMailer(token, emp.email);

    if (result) {
      await Employee.findOneAndUpdate(
        { email: { $regex: email, $options: "i" } },
        {
          reset_token: token,
          expire_token: new Date(new Date().getTime() + 30 * 60000),
        },
        { new: true }
      );

      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: AUTH_MESSAGES.EMAIL_SENT,
        data: token,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.FORGOT_PASSWORD_FAILED,
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

/* Validate reset password token is valid or not // METHOD: GET // PARAMS: token */
const validateResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const checked = await Employee.findOne({ reset_token: token });
    if (checked) {
      let user = checked.toJSON();
      let dt = new Date();
      if (dt < user.expire_token) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: AUTH_MESSAGES.URL_CORRECT,
          data: null,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: AUTH_MESSAGES.URL_EXPIRED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.LINK_INCORRECT,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (err) {
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

/* RESET PASSWORD // METHOD: POST // PAYLOAD: {token, password(new password)} */
const resetPassword = async (req, res) => {
  try {
    const newPassword = req.body.password;
    const sentToken = req.body.token;

    const encryptedPassword = await passwordHash(newPassword);

    const reset = await Employee.findOneAndUpdate(
      { reset_token: sentToken },
      {
        password: encryptedPassword,
        reset_token: null,
        expire_token: null,
      },
      { new: true }
    );

    if (reset) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESSFULLY,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.PASSWORD_RESET_UN_SUCCESSFULLY,
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

/* RESET PASSWORD // METHOD: POST // PAYLOAD: {token, password(new password)} */
const resetMasterPassword = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const { new_password, current_password } = req.body;
    const currhashPassword = md5(current_password);
    const newhashPassword = md5(new_password);

    let result;
    let setting = await Settings.countDocuments();
    if (setting > 0) {
      result = await Settings.findOneAndUpdate(
        { master_password: currhashPassword },
        { master_password: newhashPassword, updated_by: employee_code },
        { new: true }
      );
    } else {
      result = await Settings.create({
        master_password: newhashPassword,
        created_by: employee_code,
      });
    }

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESSFULLY,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.PASSWORD_RESET_UN_SUCCESSFULLY,
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

/* LOGOUT GET API with Authorization // METHOD: GET */
const logout = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    let updateObj = { token: null };
    if (req.headers["ttx_login_type"] === "tracker") {
      updateObj = { tracker_token: null };
    }
    const loggedOut = await Employee.findOneAndUpdate(
      { employee_code: employee_code },
      updateObj,
      { new: true }
    );
    if (loggedOut) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: AUTH_MESSAGES.LOGOUT_SUCCESSFUL,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: AUTH_MESSAGES.LOGOUT_FAILED,
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
  login,
  forgotPassword,
  validateResetPasswordToken,
  resetPassword,
  resetMasterPassword,
  logout,
};
