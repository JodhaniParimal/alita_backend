const { Router } = require("express");
const {
  addSnacksItems,
  updateSnacksItems,
  listItems,
  deleteItems,
  getItems,
  listItemsForEmployee,
} = require("../../controllers/snacks/items.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const { uploadSnacksItems } = require("../../services/fileUpload");
const { routeValidator } = require("../../middlewares/validator");

const itemsRouter = Router();

/* ADD ITEMS*/
itemsRouter.post(
  "/create",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_ITEMS_ADD]),
  uploadSnacksItems.single("file"),
  addSnacksItems
);

/* UPDATE ITEMS*/
itemsRouter.put(
  "/update/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_ITEMS_UPDATE]),
  uploadSnacksItems.single("file"),
  updateSnacksItems
);

/* LIST ITEMS*/
itemsRouter.post(
  "/list/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_ITEMS_VIEW]),
  listItems
);

/* Employee LIST CATEGORY*/
itemsRouter.get(
  "/employee-item-list",
  listItemsForEmployee
);

/* GET ITEMS*/
itemsRouter.get(
  "/get-items/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_ITEMS_VIEW]),
  getItems
);

/* DELETE ITEMS */
itemsRouter.delete(
  "/delete/:_id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_ITEMS_DELETE]),
  deleteItems
);

module.exports = {
  itemsRouter,
};
