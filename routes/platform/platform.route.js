const { Router } = require("express");
const { 
    addPlatform, 
    listPlatform,
    deletePlatform,
 } = require("../../controllers/platform/platform.controller");
const platformRouter = Router();

/* ADD PLATFORM*/
platformRouter.post(
    "/create",
    addPlatform
)

/* LIST PLATFORM*/
platformRouter.get(
    "/list",
    listPlatform
)

/* DELETE PLATFORM*/
platformRouter.put(
    "/delete/:_id",
    deletePlatform
)

module.exports = {
    platformRouter,
};
