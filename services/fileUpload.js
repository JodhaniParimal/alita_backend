const multer = require("multer");
const fs = require("fs");
const path = require("path");
const folderName = "public/images";
const screenshotFolder = "public/screenshots";
const { attachment } = require("./config");
const moment = require("moment");
const { AUTH_USER_DETAILS } = require("../constants/global.constants");
const Department = require("../models/department/department.model");
const { default: mongoose } = require("mongoose");

const uploadDocuments = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.originalname.includes("certificates")) {
        cb(null, "public/images/certificates");
      } else if (file.originalname.includes("documents")) {
        cb(null, "public/images/documents");
      } else {
        cb(new Error("Please select valid files"));
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  }),
});

const uploadTaskExcel = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(filePath + `/tasks`));
    },
    filename: (req, file, cb) => {
      const finalName = Date.now() + path.extname(file.originalname);
      const folderCreate = path.resolve(
        __dirname + "./../" + folderName + `/tasks`
      );

      if (!fs.existsSync(folderCreate)) fs.mkdirSync(folderCreate);
      cb(null, finalName);
    },
  }),
});

const uploadSnacksItems = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(filePath + `/snacks-items`));
    },
    filename: (req, file, cb) => {
      const finalName = Date.now() + path.extname(file.originalname);
      const folderCreate = path.resolve(
        __dirname + "./../" + folderName + `/snacks-items`
      );

      if (!fs.existsSync(folderCreate)) fs.mkdirSync(folderCreate);
      cb(null, finalName);
    },
  }),
});

const profilePicUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const destinationFolder = "public/images/profilePic";
      fs.mkdirSync(destinationFolder, { recursive: true });
      cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
      const extension = file.originalname.split(".").pop();
      const isValidFileType = isAllowedFileType(extension.toLowerCase());

      if (isValidFileType) {
        cb(null, Date.now() + "profilePic" + file.originalname);
      } else {
        cb(
          new Error(
            "Invalid file type. Only JPEG, JPG, and PNG files are allowed."
          )
        );
      }
    },
  }),
});

function isAllowedFileType(extension) {
  const allowedFiletypes = ["jpg", "jpeg", "png"];
  return allowedFiletypes.includes(extension);
}

const filePath = path.resolve(__dirname + "./../" + folderName);
if (!fs.existsSync("public") || !fs.existsSync(folderName)) {
  fs.mkdirSync("public/images");
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(filePath + `/${attachment[file.fieldname]}`));
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname.replace(/\s+/g, '_').replace(/\.[^.]+$/, '')
    const finalName = originalname + "_" + Date.now() + path.extname(file.originalname);
    const folderCreate = path.resolve(
      __dirname + "./../" + folderName + `/${attachment[file.fieldname]}`
    );

    if (!fs.existsSync(folderCreate)) fs.mkdirSync(folderCreate);
    req.body[file.fieldname] = `${attachment[file.fieldname]}/${finalName}`;

    if (!req["fields"]) {
      req["fields"] = [file.fieldname];
    } else {
      req["fields"] = [...req.fields, file.fieldname];
    }
    cb(null, finalName);
  },
});

const uploadAttachment = multer({ storage: storage });

const uploadScreenshot = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const currentDate = moment().format("DD-MM-YYYY");
      const { employee_code, firstname, department_id } = req[AUTH_USER_DETAILS];
      _id = new mongoose.Types.ObjectId(department_id)
      const department = await Department.find({ _id }).select({
        _id: 0,
        title: 1,
      })

      const folderPath = path.resolve(
        __dirname,
        "..",
        screenshotFolder,
        department[0].title,
        currentDate,
        firstname
      );

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    },
    filename: async (req, file, cb) => {
      const currentDate = moment().format("DD-MM-YYYY");
      const { firstname, department_id } = req[AUTH_USER_DETAILS];
      _id = new mongoose.Types.ObjectId(department_id)
      const department = await Department.find({ _id }).select({
        _id: 0,
        title: 1,
      })
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const amPM = hours >= 12 ? 'PM' : 'AM';
      const formattedDate = `${day}-${month}-${year}at${hours}.${minutes}${amPM}`;
      // const fileName = file.originalname;
      const fileName = `Screenshot_${formattedDate}${path.extname(file.originalname)}`;

      const filePath = path.join(
        "screenshots",
        department[0].title,
        currentDate,
        firstname,
        fileName
        // file.originalname
      );

      req.body[file.fieldname] = filePath;

      cb(null, fileName);
      // cb(null, file.originalname);
    },
  }),
});

module.exports = {
  uploadDocuments,
  profilePicUpload,
  uploadAttachment,
  uploadTaskExcel,
  uploadScreenshot,
  uploadSnacksItems,
};
