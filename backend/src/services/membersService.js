const Membership = require("../model/Membership.js");


const deleteMemberService = async (organizationId, membershipId,requestingUserId) => {

    const response = await Membership.findOne({
        _id: membershipId,
        organizationId: organizationId,
        status: "active"
    }).populate("roleId userId");


    


    if (!response) {
        const error = new Error(
            "Member does not exist in given organisation"
        );

        error.statusCode = 404;
        throw error;
    }

     // Validate membership ID
            if (!membershipId) {
                const error = new Error("Membership ID is required");
                error.statusCode = 400;
                throw error;
            }
    
            // Prevent user from suspending themselves
            if (requestingUserId.toString() === membershipId.toString()) {
                const error = new Error(
                    "You cannot remove yourself from the organization"
                );
                error.statusCode = 403;
                throw error;
            }


    // Suspend membership instead of permanently deleting it
    response.status ="suspended"

    await response.save();


    return {
        id: response._id,
        user: response.userId,
        status: response.status
    };

};


module.exports = {
    deleteMemberService
};