const { Router } = require("express");
const {
  addSnacksCategory,
  updateSnacksCategory,
  listCategory,
  deleteCategory,
  getCategory,
  listCategoryForDropdown,
} = require("../../controllers/snacks/category.controller");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const {
  addCategoryValidationRules,
} = require("../../validation_rules/snacks/category.validation");
const { validateApi, routeValidator } = require("../../middlewares/validator");

const categoryRouter = Router();

/* ADD CATEGORY*/
categoryRouter.post(
  "/create",
  addCategoryValidationRules(),
  validateApi,
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_CATEGORY_ADD]),
  addSnacksCategory
);

/* UPDATE CATEGORY*/
categoryRouter.put(
  "/update/:id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_CATEGORY_UPDATE]),
  updateSnacksCategory
);

/* LIST CATEGORY*/
categoryRouter.post(
  "/list",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_CATEGORY_VIEW]),
  listCategory
);

/* Employee LIST CATEGORY*/
categoryRouter.post(
  "/employee-list",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_CATEGORY_VIEW]),
  routeValidator(true, { is_available: true }),
  listCategory
);

/* GET ONE CATEGORY*/
categoryRouter.get(
  "/get-category/:_id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_CATEGORY_VIEW]),
  getCategory
);

/* LIST CATEGORY WITHOUT PERMISSION*/
categoryRouter.get("/list-categories", listCategoryForDropdown);

/* DELETE CATEGORY */
categoryRouter.delete(
  "/delete/:_id",
  authPermissions([ENUMS.PERMISSION_TYPE.SNACKS_CATEGORY_DELETE]),
  deleteCategory
);

module.exports = {
  categoryRouter,
};
