const express=require("express");

const router=express.Router();

const authenticate = require("../middleware/isAuth.js");
const authorize = require("../middleware/authorize.js");

const validate = require("../middleware/validate.js");

const {
    createProjectSchema,updateProjectSchema
} = require("../validators/zod.js");

const {
    createProjectController,getOrganisationProjectController,getProjectByIdController,updateProjectController,deleteProjectController

} = require("../controller/projectController.js");



router.post("/:organizationId/projects",authenticate,authorize("project:create"),validate(createProjectSchema),createProjectController)

router.get("/:organizationId/projects",authenticate,authorize("project:view"),getOrganisationProjectController)

router.get(
    "/:organizationId/projects/:projectId",
    authenticate,
    authorize("project:view"),
    getProjectByIdController
);


router.put("/:organizationId/projects/:projectId",authenticate,authorize("project:update"),validate(updateProjectSchema),updateProjectController)


router.delete(
    "/:organizationId/projects/:projectId",
    authenticate,
    authorize("project:delete"),
    deleteProjectController
);


module.exports=router;