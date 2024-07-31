var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var io = require("./helpers/socket");

var swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");

var { indexRouter } = require("./routes/index");

var app = express();

io.on("connection", function (socket) {
  console.log("socket connected");
  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
});

io.on("error", function () {
  console.log("errr");
});
require("./services/cron.scheduler");
require("dotenv").config();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(cors("*"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/example-files", express.static("public/example-files/"));
app.use("/images", express.static("public/images/"));
app.use("/screenshots", express.static("public/screenshots/"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "API not found!"));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
