const { Router } = require("express");
const { bidsRouter } = require("./bids.routes");

const bidsIndex = new Router();

bidsIndex.use("/", bidsRouter);

module.exports = { bidsIndex };
