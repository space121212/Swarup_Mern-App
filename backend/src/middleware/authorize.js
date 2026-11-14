const Membership = require("../model/Membership.js");

const authorize = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const organizationId = req.params.organizationId;

            if (!organizationId) {
                const error = new Error(
                    "Organization ID is required"
                );
                error.statusCode = 400;
                throw error;
            }

            const membership = await Membership.findOne({
                userId: req.user.userId,
                organizationId,
                status: "active"
            }).populate({
                path: "roleId",
                populate: {
                    path: "permissions"
                }
            });

            if (!membership) {
                const error = new Error(
                    "You are not a member of this organization"
                );
                error.statusCode = 403;
                throw error;
            }

            const hasPermission =
                membership.roleId.permissions.some(
                    (permission) =>
                        permission.name === requiredPermission
                );

            if (!hasPermission) {
                const error = new Error(
                    "You do not have permission to perform this action"
                );
                error.statusCode = 403;
                throw error;
            }

            req.membership = membership;

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authorize;