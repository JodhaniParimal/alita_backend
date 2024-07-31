const { Router } = require("express");
const {
  addTechnology,
  listTechnology,
  deleteTechnology,
  updateTechnology,
} = require("../../controllers/technology/technology.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const technologyRouter = Router();

/* ADD TECHNOLOGY*/
technologyRouter.post(
  "/create",
  authPermissions([ENUMS.PERMISSION_TYPE.TECHNOLOGY_ADD]),
  addTechnology
);

/* UPDATE TECHNOLOGY*/
technologyRouter.put(
  "/update/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.TECHNOLOGY_UPDATE]),
  updateTechnology
);

/* LIST TECHNOLOGY*/
technologyRouter.get(
  "/list",
  authPermissions([ENUMS.PERMISSION_TYPE.TECHNOLOGY_VIEW]),
  listTechnology
);

/* LIST TECHNOLOGY WITHOUT PERMISSION*/
technologyRouter.get(
  "/list/dropdown",
  listTechnology
);

/* DELETE TECHNOLOGY {HARD DELETE}*/
technologyRouter.delete(
  "/delete/:_id",
  authPermissions([ENUMS.PERMISSION_TYPE.TECHNOLOGY_DELETE]),
  deleteTechnology
);

module.exports = {
  technologyRouter,
};
