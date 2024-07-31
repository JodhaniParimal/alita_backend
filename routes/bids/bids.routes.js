const express = require("express");
const {
  addBids,
  updateBids,
  listBids,
  listBidsById,
} = require("../../controllers/bids/bids.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const {
  addBidsValidation,
} = require("../../validation_rules/bids/addBids.validation");
const { validateApi } = require("../../middlewares/validator");
const {
  updateBidsValidation,
} = require("../../validation_rules/bids/updateBids.validation");
const { ENUMS } = require("../../constants/enum.constants");

const bidsRouter = express.Router();

/* LIST BID*/
bidsRouter.post(
  "/list-bids",
  authPermissions([ENUMS.PERMISSION_TYPE.BID_VIEW]),
  listBids
);

/* LIST BID BY ID*/
bidsRouter.get(
  "/list-bids/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.BID_VIEW]),
  listBidsById
);

/* ADD BID*/
bidsRouter.post(
  "/add-bids",
  addBidsValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.BID_ADD]),
  addBids
);

/* UPDATE BID*/
bidsRouter.put(
  "/update-bids/:id",
  updateBidsValidation(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.BID_UPDATE]),
  updateBids
);

module.exports = { bidsRouter };
