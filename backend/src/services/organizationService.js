const Organization = require("../model/Organisation.js");
const Membership = require("../model/Membership.js");
const User = require("../model/User.js");
const Role = require("../model/Role.js");
const mongoose = require("mongoose");

const { createOrganizationRoles } = require("./rbacService.js");



const createOrganization = async ({ name, slug }, userId) => {
    const session = await mongoose.startSession();

    try {
        let organization;

        await session.withTransaction(async () => {
            const existingOrganization = await Organization.findOne(
                { slug },
                null,
                { session }
            );

            if (existingOrganization) {
                const error = new Error(
                    "Organization slug already exists"
                );
                error.statusCode = 409;
                throw error;
            }

            const createdOrganizations = await Organization.create(
                [
                    {
                        name,
                        slug,
                        ownerId: userId
                    }
                ],
                { session }
            );

            organization = createdOrganizations[0];

            const roles = await createOrganizationRoles(
                organization._id,
                session
            );

            await Membership.create(
                [
                    {
                        userId,
                        organizationId: organization._id,
                        roleId: roles.Owner._id,
                        status: "active"
                    }
                ],
                { session }
            );
        });

        return organization;
    } finally {
        await session.endSession();
    }
};

const addOrganizationMember = async (
    organizationId,
    requestingUserId,
    { email, role }
) => {
    const organization = await Organization.findById(
        organizationId
    );

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }


   

    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const existingMembership = await Membership.findOne({
        userId: user._id,
        organizationId
    });

    if (existingMembership) {
        const error = new Error(
            "User is already a member of this organization"
        );
        error.statusCode = 409;
        throw error;
    }

    const roleDocument = await Role.findOne({
        organizationId,
        name: role
    });

    if (!roleDocument) {
        const error = new Error("Role not found");
        error.statusCode = 404;
        throw error;
    }

    const membership = await Membership.create({
        userId: user._id,
        organizationId,
        roleId: roleDocument._id,
        status: "active"
    });

    return membership;
};

const getUserOrganizations = async (userId) => {
    const memberships = await Membership.find({
        userId,
        status: "active"
    })
        .populate("organizationId")
        .populate({
            path: "roleId",
            populate: {
                path: "permissions"
            }
        });

    return memberships;
};


const getOrganizationMembers = async (organizationId,page,limit) => {
    const organization = await Organization.findById(organizationId);

    

    if (!organization) {
        const error = new Error("Organization not found");
        error.statusCode = 404;
        throw error;
    }

    const skip=(page-1)* limit

    const [memberships,totalMembership] = await Promise.all([Membership.find({
        organizationId,
        status: "active"
    })
        .populate("userId", "name email")
        .populate("roleId", "name")
        .select("-__v")
        .sort({ createdAt: -1 }).skip(skip).limit(limit),

        Membership.countDocuments({organizationId,status:"active"})

])     

    return {memberships,
            pagination:{
                page,
                limit,
                totalMembership,
                skip,
                totalPages: Math.ceil(totalMembership / limit)


            }
        }
};




const updateOrganizationMemberRole = async (
    organizationId,
    membershipId,
    roleName
) => {
    // Find an active membership in this organization
    const membership = await Membership.findOne({
        _id: membershipId,
        organizationId,
        status: "active"
    }).populate("roleId", "name");

    if (!membership) {
        const error = new Error("Active organization member not found");
        error.statusCode = 404;
        throw error;
    }

    // Prevent changing the owner's role
    if (membership.roleId?.name === "Owner") {
        const error = new Error("The organization owner's role cannot be changed");
        error.statusCode = 403;
        throw error;
    }

    // Do not allow assigning the Owner role through this endpoint
    if (roleName === "Owner") {
        const error = new Error("The Owner role cannot be assigned through this endpoint");
        error.statusCode = 400;
        throw error;
    }

    // Ensure the requested role belongs to this organization
    const role = await Role.findOne({
        organizationId,
        name: roleName
    });

    if (!role) {
        const error = new Error("Role not found in this organization");
        error.statusCode = 404;
        throw error;
    }

    membership.roleId = role._id;
    await membership.save();

    return Membership.findById(membership._id)
        .populate("userId", "name email")
        .populate("roleId", "name")
        .select("-__v");
};



const removeOrganizationMember = async (
    organizationId,
    membershipId,
    requestingUserId
) => {
    const membership = await Membership.findOne({
        _id: membershipId,
        organizationId,
        status: "active"
    }).populate("roleId", "name");

    if (!membership) {
        const error = new Error("Active organization member not found");
        error.statusCode = 404;
        throw error;
    }

    // Prevent users from removing their own membership
    if (membership.userId.toString() === requestingUserId.toString()) {
        const error = new Error(
            "You cannot remove your own organization membership"
        );
        error.statusCode = 403;
        throw error;
    }

    // Prevent removal of the organization owner
    if (membership.roleId?.name === "Owner") {
        const error = new Error(
            "The organization owner cannot be removed"
        );
        error.statusCode = 403;
        throw error;
    }

    membership.status = "suspended";
    await membership.save();

    return {
        membershipId: membership._id,
        status: membership.status
    };
};


module.exports = {
    createOrganization,addOrganizationMember,getUserOrganizations,getOrganizationMembers,updateOrganizationMemberRole,removeOrganizationMember
};