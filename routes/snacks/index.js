var express = require("express");
var snacksRouter = express.Router();

var { categoryRouter } = require("./category.route");
const { itemsRouter } = require("./items.route");
const { ordersRouter } = require("./orders/index");

snacksRouter.use("/category", categoryRouter);
snacksRouter.use("/items", itemsRouter);
snacksRouter.use("/order", ordersRouter);

module.exports = { snacksRouter };
