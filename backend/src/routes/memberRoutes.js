const express = require("express");

const authenticate = require("../middleware/isAuth.js");

const authorize = require("../middleware/authorize.js");

const memberDeleteController = require("../controller/membersController.js");

const route = express.Router();


route.delete(
    "/:organizationId/members12/:membershipId/",
    authenticate,
    authorize("member:remove"),
    memberDeleteController
);


module.exports = route;