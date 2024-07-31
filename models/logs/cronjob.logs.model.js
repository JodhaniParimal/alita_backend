const mongoose = require("mongoose");
const { CRON_JOB_LOGS } = require("../../constants/models.enum.constants");

const { Schema } = mongoose;

var schema = Schema({
  title: { type: String, required: true },
  status: { type: String, required: true },
  message: { type: String, required: true },
  created_date: {
    type: Date,
    default: new Date(),
  },
});

const Cron_Job_Logs = mongoose.model(CRON_JOB_LOGS, schema);
module.exports = { Cron_Job_Logs };
