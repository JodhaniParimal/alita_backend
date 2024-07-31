var express = require("express");
const ordersRouter = express.Router();

const { orderRouter } = require("./order.route");
const { reportRouter } = require("./report.route");

ordersRouter.use("/", orderRouter);
ordersRouter.use("/reports", reportRouter);

module.exports = { ordersRouter };
