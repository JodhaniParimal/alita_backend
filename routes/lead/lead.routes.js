const express = require("express");
const {
  addLead,
  updateLead,
  listLead,
  listLeadById,
  listLeadCode,
  listLeadTlPm,
} = require("../../controllers/lead/lead.controller");
const {
  addLeadValidation,
} = require("../../validation_rules/lead/addLead.validation");
const { validateApi } = require("../../middlewares/validator");
const {
  updateLeadValidation,
} = require("../../validation_rules/lead/updateLead.validation");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const leadRouter = express.Router();

// get lead
leadRouter.post(
  "/list-lead",
  authPermissions([ENUMS.PERMISSION_TYPE.LEAD_VIEW]),
  listLead
);
// get lead
leadRouter.post(
  "/employee-list-lead",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_LEAD_VIEW]),
  listLeadTlPm
);

// get lead by id
leadRouter.get(
  "/list-lead/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.LEAD_VIEW]),
  listLeadById
);

// get lead by id
leadRouter.get(
  "/employee-list-lead/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_LEAD_VIEW]),
  listLeadById
);

leadRouter.get(
  "/list-lead-code",
  authPermissions([ENUMS.PERMISSION_TYPE.LEAD_VIEW]),
  listLeadCode
);

// create lead
leadRouter.post(
  "/add-lead",
  addLeadValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.LEAD_ADD]),
  addLead
);

// update lead
leadRouter.put(
  "/update-lead/:id",
  updateLeadValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.LEAD_UPDATE]),
  updateLead
);

module.exports = { leadRouter };
