const Membership = require("../model/Membership.js");
const Role = require("../model/Role.js");

const migrateMembershipRoles = async () => {
    const memberships = await Membership.find();

    for (const membership of memberships) {
        const role = await Role.findOne({
            organizationId: membership.organizationId,
            name: membership.role
        });

        if (!role) {
            throw new Error(
                `Role not found for membership ${membership._id}`
            );
        }

        await Membership.collection.updateOne(
            { _id: membership._id },
            {
                $set: {
                    roleId: role._id
                }
            }
        );

        console.log(
            `Migrated ${membership._id}: ${membership.role} -> ${role._id}`
        );
    }

    console.log("Membership roles migrated successfully");
};

module.exports = {
    migrateMembershipRoles
};