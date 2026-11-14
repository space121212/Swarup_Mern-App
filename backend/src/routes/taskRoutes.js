const express=require("express");
const router=express.Router();
const authenticate = require("../middleware/isAuth.js");
const authorize = require("../middleware/authorize.js");

const {createTaskController,getProjectTaskController,getTaskByIdController,deleteTaskController,updateTaskController}=require('../controller/taskController.js')

const validate = require("../middleware/validate.js");


const {createTaskSchema,updateTaskSchema} = require("../validators/zod.js");





router.post(
    "/:organizationId/projects/:projectId/tasks",
    authenticate,
    authorize("task:create"),
    validate(createTaskSchema),
    createTaskController
);


router.get(
    "/:organizationId/projects/:projectId/tasks",
    authenticate,
    authorize("task:view"),
    getProjectTaskController
);


router.get(
    "/:organizationId/projects/:projectId/tasks/:taskId",
    authenticate,
    authorize("task:view"),
    getTaskByIdController
);

router.delete(
    "/:organizationId/projects/:projectId/tasks/:taskId",
    authenticate,
    authorize("task:delete"),
    deleteTaskController
);

router.put(
    "/:organizationId/projects/:projectId/tasks/:taskId",
    authenticate,
    authorize("task:update"),
    validate(updateTaskSchema),
    updateTaskController
);



module.exports=router;