const Task = require("../model/Task.js");
const Project = require("../model/Project.js");
const Membership = require("../model/Membership.js");

const createTask = async ({
    organizationId,
    projectId,
    userId,
    title,
    description,
    assignedTo,
    priority
}) => {

    const project = await Project.findOne({
        _id: projectId,
        organizationId
    });

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }
    if (assignedTo) {
    const member = await Membership.findOne({
        userId: assignedTo,
        organizationId,
        status: "active"
    });

    if (!member) {
        const error = new Error(
            "Assigned user is not a member of this organization"
        );
        error.statusCode = 400;
        throw error;
    }
}

    const task = await Task.create({
        projectId,
        createdBy: userId,
        title,
        description,
        assignedTo: assignedTo || null,
        priority: priority || "medium"
    });

    return task;
};



const getProjectTask = async (
    organizationId,
    projectId,
    page = 1,
    limit = 10
) => {
    const project = await Project.findOne({
        _id: projectId,
        organizationId
    });

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    const skip = (page - 1) * limit;

    const [tasks, totalTasks] = await Promise.all([
        Task.find({ projectId })
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Task.countDocuments({ projectId })
    ]);

    return {
        tasks,
        pagination: {
            page,
            limit,
            skip,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit)
        }
    };
};

const getTaskById=async(organizationId,projectId,taskId)=>{


    console.log("first")

    const project=await Project.findOne({
        _id:projectId,
        organizationId
    })
     console.log("second")

    if(!project){
        const error=new Error("Project does not exist");
        error.statusCode = 404;
        throw error
    }

     console.log("third")

    const task=await Task.findOne({
        _id:taskId,
        projectId
    }).populate("createdBy","name email")
    .populate("assignedTo","name email")
if (!task) {
  const error = new Error("Task not found");
  error.statusCode = 404;
  throw error;
}


    return task;
}


const deleteTask=async(organizationId,projectId,taskId)=>{

    const project=await Project.findOne({
        _id:projectId,
        organizationId
    })

    if(!project){

        const error=new Error("Project not found");
        error.statusCode=404;
        throw error;
    }

    const task=await Task.findOneAndDelete({
        _id:taskId,
        projectId
    })

    if(!task){
        const error=new Error("Task not found");
        error.statusCode=404;
        throw error
    }

    return task;

}

const updateTask = async (
    organizationId,
    projectId,
    taskId,
    data
) => {

    const project = await Project.findOne({
        _id: projectId,
        organizationId
    });

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }
    if (data.assignedTo) {
    const member = await Membership.findOne({
        userId: data.assignedTo,
        organizationId,
        status: "active"
    });

    if (!member) {
        const error = new Error(
            "Assigned user is not a member of this organization"
        );
        error.statusCode = 400;
        throw error;
    }
}

    const task = await Task.findOneAndUpdate(
        {
            _id: taskId,
            projectId
        },
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    )
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");

    if (!task) {
        const error = new Error("Task not found");
        error.statusCode = 404;
        throw error;
    }

    return task;
};

module.exports = {
    createTask,getProjectTask,getTaskById,deleteTask,updateTask
};