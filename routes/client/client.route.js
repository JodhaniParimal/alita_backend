const { Router } = require("express");
const {
    addClientInformation,
    updateClientInformation,
    getClientById,
    listClient,
    deleteClient,
    listClientForDropdown,
} = require("../../controllers/client/client.controller");
const {
    addClientValidation,
} = require("../../validation_rules/client/client.validation");
const { validateApi } = require("../../middlewares/validator");
const { authPermissions } = require("../../middlewares/auth.guard");
const { ENUMS } = require("../../constants/enum.constants");
const clientRouter = Router();

/* ADD CLIENT*/
clientRouter.post(
    "/create",
    addClientValidation(),
    validateApi,
    authPermissions([ENUMS.PERMISSION_TYPE.CLIENT_ADD]),
    addClientInformation
);

/* UPDATE CLIENT*/
clientRouter.put(
    "/update/:_id",
    authPermissions([ENUMS.PERMISSION_TYPE.CLIENT_UPDATE]),
    updateClientInformation
);

/* GET ONE CLIENT BY ID*/
clientRouter.get(
    "/one-client/:id",
    authPermissions([ENUMS.PERMISSION_TYPE.CLIENT_VIEW]),
    getClientById
);

/* GET ALL CLIENT*/
clientRouter.post(
    "/all-client",
    authPermissions([ENUMS.PERMISSION_TYPE.CLIENT_VIEW]),
    listClient
);

/* GET ALL CLIENT FOR DROPDOWN*/
clientRouter.get(
    "/client-dropdown",
    // authPermissions([ENUMS.PERMISSION_TYPE.EMPLOYEE_LEAD_VIEW]),
    listClientForDropdown
);

/* DELETE CLIENT*/
clientRouter.put(
    "/delete/:id",
    authPermissions([ENUMS.PERMISSION_TYPE.CLIENT_DELETE]),
    deleteClient
);


module.exports = {
    clientRouter,
};
