const Project=require("../model/Project.js")


const createProject=async(organizationId,userId,{name,description})=>{



    const project=await Project.create({
        name,
        description,
        organizationId,
        createdBy:userId

    })

    return project;
}


const getOrganizationProjects = async (
    organizationId,
    page,
    limit
) => {
    const skip = (page - 1) * limit;

    const [projects, totalProjects] = await Promise.all([
        Project.find({ organizationId })
            .populate("createdBy", "name email")
            .populate("organizationId", "name slug")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit),

        Project.countDocuments({ organizationId })
    ]);

    return {
        projects,
        pagination: {
            page,
            limit,
            totalProjects,
            totalPages: Math.ceil(totalProjects / limit)
        }
    };
};

const getProjectById = async (projectId, organizationId) => {

    const project = await Project.findOne({
        _id: projectId,
        organizationId
    })
    .populate("organizationId", "name slug")
    .populate("createdBy", "name email");

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    return project;
};



const updateProject = async (
    organizationId,
    projectId,
    { name, description }
) => {
    const project = await Project.findOneAndUpdate(
        {
            _id: projectId,
            organizationId
        },
        {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description })
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    );
 
    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }
 
    return project;
};


const deleteProject = async (projectId, organizationId) => {

    const project = await Project.findOneAndDelete({
        _id: projectId,
        organizationId
    });

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    return project;
};

module.exports={createProject, getOrganizationProjects,getProjectById,updateProject,deleteProject};