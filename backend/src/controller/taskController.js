const {createTask,getProjectTask,getTaskById,deleteTask,updateTask}=require('../services/taskService.js')

const createTaskController=async(req,res,next)=>{

    try {

        const {organizationId,projectId} = req.params;

        const userId=req.user.userId;

        const task=await createTask({organizationId,projectId,userId,
            ...req.body});

        if(task){

            return res.status(201).json({
                success:true,
                message:"Task created successfully",
                task
            })
        }
        
    } catch (error) {
        next(error)
      



        
    }
}


const getProjectTaskController = async (req, res, next) => {
    try {
        const { organizationId, projectId } = req.params;

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const result = await getProjectTask(
            organizationId,
            projectId,
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
};


const getTaskByIdController=async(req,res,next)=>{

    try {

        const {organizationId,projectId,taskId}=req.params;

        console.log(organizationId,projectId,taskId);

        const task=await getTaskById(organizationId,projectId,taskId);

        return res.status(200).json({
            success:true,
            task
        })
        
    } catch (error) {

        next(error)
        
    }
}


const deleteTaskController=async(req,res,next)=>{

    try {
        const {organizationId,projectId,taskId}=req.params;

        await deleteTask(organizationId,projectId,taskId);


        return res.status(200).json({
            success:true,
            message:"Task is deleted successfully"
        }
        )
        
    } catch (error) {
        next(error);
        
    }
}

const updateTaskController = async (req, res, next) => {
    try {

        const {
            organizationId,
            projectId,
            taskId
        } = req.params;

        const task = await updateTask(
            organizationId,
            projectId,
            taskId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        next(error);
    }
};


module.exports={createTaskController,getProjectTaskController,getTaskByIdController,deleteTaskController,updateTaskController}