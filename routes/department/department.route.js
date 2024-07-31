const { Router } = require("express");
const {
    addDepartment,
    listDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
} = require("../../controllers/department/department.controller");
const { ENUMS } = require("../../constants/enum.constants");
const { authPermissions } = require("../../middlewares/auth.guard");
const departmentRouter = Router();

/* ADD DEPARTMENT*/
departmentRouter.post(
    "/create",
    authPermissions([ENUMS.PERMISSION_TYPE.DEPARTMENT_ADD]),
    addDepartment
);

/* ADD DEPARTMENT BY ID*/
departmentRouter.put(
    "/update/:id",
    authPermissions([ENUMS.PERMISSION_TYPE.DEPARTMENT_UPDATE]),
    updateDepartment
);

/* GET ONE DEPARTMENT BY ID*/
departmentRouter.get(
    "/one-department/:id",
    authPermissions([ENUMS.PERMISSION_TYPE.DEPARTMENT_VIEW]),
    getDepartmentById
);

/* LIST DEPARTMENT*/
departmentRouter.get(
    "/list",
    authPermissions([ENUMS.PERMISSION_TYPE.DEPARTMENT_VIEW]),
    listDepartment
);

/* DELETE DEPARTMENT*/
departmentRouter.put(
    "/delete/:id",
    authPermissions([ENUMS.PERMISSION_TYPE.DEPARTMENT_DELETE]),
    deleteDepartment
);


module.exports = {
    departmentRouter,
};
