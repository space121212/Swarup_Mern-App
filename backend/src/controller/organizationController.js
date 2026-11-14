const {
    createOrganization,
    getUserOrganizations,
    addOrganizationMember,getOrganizationMembers,removeOrganizationMember,updateOrganizationMemberRole
} = require("../services/organizationService.js");

const createOrganizationController = async (req, res, next) => {

    try {

        const organization = await createOrganization(
            req.body,
            req.user.userId
        );

        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization
        });

    } catch (error) {
        next(error);
    }
};


const getUserOrganisationController=async (req,res,next) =>{


    try {

        const userId=req.user.userId;

        const result=await getUserOrganizations(userId);

        return res.status(200).json({
            success:true,
            result
        });




        
    } catch (error) {

        next(error);
        
    }


}


const addOrganizationMemberController=async (req,res,next)=>{



    try {

        const organizationId=req.params.organizationId;
        const requestingUserId=req.user.userId;

        const result=await addOrganizationMember(organizationId,requestingUserId,req.body)

        return res.status(200).json({
            success:true,
            message:'User addded to organization successfully',
            result
        })
        
    } catch (error) {
        next(error)
        
    }



}

const getOrganizationMembersController=async(req,res,next)=>{

    try {


       
            const pageValue = req.query.page ?? "1";
            const limitValue = req.query.limit ?? "5";

            const isPositiveInteger = (value) =>
                typeof value === "string" && /^[1-9]\d*$/.test(value);

            if (
                !isPositiveInteger(pageValue) ||
                !isPositiveInteger(limitValue)
            ) {
                const error = new Error(
                    "Page and limit must be positive integers"
                );
                error.statusCode = 400;
                throw error;
            }

            const page = Number(pageValue);
            const limit = Number(limitValue);

            if (
                !Number.isSafeInteger(page) ||
                !Number.isSafeInteger(limit) ||
                limit > 100
            ) {
                const error = new Error(
                    "Page must be a safe integer and limit must be between 1 and 100"
                );
                error.statusCode = 400;
                throw error;
            }


        const {organizationId}=req.params;

        const result=await getOrganizationMembers(organizationId,page,limit);

        return res.status(200).json({

            success:true,
            ...result

        })
        
    } catch (error) {

        next(error)
        
    }
}


const updateOrganizationMemberRoleController = async (
    req,
    res,
    next
) => {
    try {
        const { organizationId, membershipId } = req.params;
        const { role } = req.body;

        if (
            typeof role !== "string" ||
            !["Admin", "Member", "Viewer"].includes(role)
        ) {
            const error = new Error(
                "Role must be Admin, Member, or Viewer"
            );
            error.statusCode = 400;
            throw error;
        }

        const membership = await updateOrganizationMemberRole(
            organizationId,
            membershipId,
            role
        );

        return res.status(200).json({
            success: true,
            message: "Member role updated successfully",
            membership
        });
    } catch (error) {
        next(error);
    }
};


const removeOrganizationMemberController = async (
    req,
    res,
    next
) => {
    try {
        const { organizationId, membershipId } = req.params;

        const result = await removeOrganizationMember(
            organizationId,
            membershipId
            ,req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Organization member removed successfully",
            result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createOrganizationController,
    getUserOrganisationController,
    addOrganizationMemberController,
    getOrganizationMembersController,
    removeOrganizationMemberController,
    updateOrganizationMemberRoleController
};