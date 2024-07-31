var express = require("express");
var authRouter = express.Router();

const {
  login,
  forgotPassword,
  validateResetPasswordToken,
  resetPassword,
  logout,
  resetMasterPassword,
} = require("../../controllers/auth/auth.controller");
const { validateApi } = require("../../middlewares/validator");
const {
  loginValidationRules,
  forgetPasswordValidationRules,
  resetPasswordValidationRules,
  resetMasterPasswordValidationRules,
} = require("../../validation_rules/auth.validation");

const { auth, authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");

/* LOGIN API */
authRouter.post("/login", loginValidationRules(), validateApi, login);

/* Profile View*/

/* FORGOT PASSWORD API */
authRouter.post(
  "/forget-password",
  forgetPasswordValidationRules(),
  validateApi,
  forgotPassword
);

/* Validate reset password token API */
authRouter.get(
  "/reset-password/:token",
  validateApi,
  validateResetPasswordToken
);

/* RESET PASSWORD API */
authRouter.post(
  "/reset-password",
  resetPasswordValidationRules(),
  validateApi,
  resetPassword
);

/* RESET MASTER PASSWORD API */
authRouter.post(
  "/reset-master-password",
  resetMasterPasswordValidationRules(),
  validateApi,
  auth,
  authPermissions([ENUMS.PERMISSION_TYPE.MASTER_PASSWORD_EDIT]),
  resetMasterPassword
);

/* LOGOUT API */
authRouter.get("/logout", auth, logout);

module.exports = { authRouter };
