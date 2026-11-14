const {
    deleteMemberService
} = require("../services/membersService.js");


async function memberDeleteController(req, res, next) {
    try {

        const organizationId = req.params.organizationId;

        const membershipId=req.params.membershipId;


        const requestingUserId=req.user.userId;

        

       

        const membershipResponse = await deleteMemberService(
            organizationId,
            membershipId,requestingUserId
        );

        return res.status(200).json({
            success: true,
            message: "Member suspended successfully",
            data: membershipResponse
        });

    } catch (error) {
        next(error);
    }
}


module.exports = memberDeleteController;