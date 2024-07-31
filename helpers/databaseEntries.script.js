const {
  DEFAULT_ROLE,
  DEFAULT_DEPARTMENT,
} = require("../constants/defaultData.constants");
const Department = require("../models/department/department.model");
const Employee = require("../models/employee/employee.model");
const Roles = require("../models/role/role.model");
const bcrypt = require("bcryptjs");
const { passwordHash } = require("./fn");

require("dotenv").config();

const roleEntry = async () => {

  const role_details = await Roles.findOne({ role: DEFAULT_ROLE });
  let role_id = "";
  if (role_details) {
    role_id = role_details._id;
  } else {
    let role_detail = await Roles.create({ role: DEFAULT_ROLE });
    role_id = role_detail._id;
  }
  return role_id;
};

const departmentEntry = async () => {
  const dep_details = await Department.findOne({ title: DEFAULT_DEPARTMENT });
  let dep_id = "";
  if (dep_details) {
    dep_id = dep_details._id;
  } else {
    let dep_detail = await Department.create({ title: DEFAULT_DEPARTMENT });
    dep_id = dep_detail._id;
  }
  return dep_id;
};

const dataEntry = async (req, res) => {
  try {
    let count = await Employee.countDocuments();
    if (count == 0) {
      const role_id = await roleEntry();
      const dep_id = await departmentEntry();
      const hashedPassword = await passwordHash(
        process.env.REGISTERED_PASSWORD
      );
      return await Employee.create({
        employee_code: "Al-000001",
        email: process.env.REGISTERED_EMAIL,
        password: hashedPassword,
        role_id: role_id,
        department_id: dep_id,
      });
    }
  } catch (error) {
    return new Error(error);
  }
};

module.exports = { dataEntry };
