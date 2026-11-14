const {createProject, getOrganizationProjects,getProjectById,updateProject,deleteProject}=require("../services/projectService.js")


const createProjectController=async(req,res,next)=>{

    try {

        const {organizationId}=req.params;

        const userId=req.user.userId;




      

        const project=await createProject(
            organizationId,
            userId,
            req.body
        )


        return res.status(200).json({
            success:true,
            message:"Project created successfully",
            project
        })


        
    } catch (error) {
        next(error)
        
    }




}


const getOrganisationProjectController=async(req,res,next)=>{

    try {

        const {organizationId}=req.params;
        

        const page = Math.max(
    1,
    parseInt(req.query.page, 10) || 1
);

const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 5)
);

const result = await getOrganizationProjects(
    organizationId,
    page,
    limit
);

return res.status(200).json({
    success: true,
    ...result
});
        
    } catch (error) {

        next(error);
        
    }
}

const getProjectByIdController = async (req, res, next) => {
    try {

        const { organizationId, projectId } = req.params;

        const project = await getProjectById(
            projectId,
            organizationId
        );

        res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        next(error);
    }
};



const updateProjectController = async (req, res, next) => {
    try {
        const { organizationId, projectId } = req.params;
 
        const project = await updateProject(
            organizationId,
            projectId,
            req.body
        );
 
        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project
        });
    } catch (error) {
        next(error);
    }
};


const deleteProjectController = async (req, res, next) => {
    try {
        const { organizationId, projectId } = req.params;

        await deleteProject(
            projectId,
            organizationId
        );

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};



module.exports={createProjectController,getOrganisationProjectController,getProjectByIdController,updateProjectController,deleteProjectController};
