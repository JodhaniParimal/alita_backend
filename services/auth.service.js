const jwt = require("jsonwebtoken");
require("dotenv").config();

/**Token Generation */
const generateToken = (data) => {
  let jwtSecretKey = process.env.SECRET_KEY;

  return jwt.sign(data, jwtSecretKey, { expiresIn: "24h" });
};
const generateTokenForgotPassword = (data) => {
  let jwtSecretKey = process.env.SECRET_KEY;

  return jwt.sign(data, jwtSecretKey);
};

const authService = {
  generateToken,
  generateTokenForgotPassword,
};

module.exports = authService;
