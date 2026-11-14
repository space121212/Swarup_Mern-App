const Permission = require("../model/Permission.js");
const Role = require("../model/Role.js");
const Organization = require("../model/Organisation.js");

const permissions = [
    "member:view",
    "member:invite",
    "member:remove",
    "member:update_role",

    "project:view",
    "project:create",
    "project:update",
    "project:delete",

    "task:view",
    "task:create",
    "task:update",
    "task:delete",
    "task:assign"
];

const rolePermissions = {
    Owner: permissions,

    Admin: [
        "member:view",
        "member:invite",
        "member:remove",
        "member:update_role",
        "project:view",
        "project:create",
        "project:update",
        "project:delete",
        "task:view",
        "task:create",
        "task:update",
        "task:delete",
        "task:assign"
    ],

    Member: [
        "member:view",
        "project:view",
        "project:create",
        "project:update",
        "task:view",
        "task:create",
        "task:update",
        "task:assign"
    ],

    Viewer: [
        "member:view",
        "project:view",
        "task:view"
    ]
};

const seedRBAC = async () => {

    // 1. Create/find permissions
    const permissionMap = {};

    for (const permissionName of permissions) {
        let permission = await Permission.findOne({
            name: permissionName
        });

        if (!permission) {
            permission = await Permission.create({
                name: permissionName,
                description: permissionName
            });
        }

        permissionMap[permissionName] = permission._id;
    }

    // 2. Get all organizations
    const organizations = await Organization.find();

    // 3. Create roles for every organization
    for (const organization of organizations) {

        for (const [roleName, rolePermissionNames] of Object.entries(
            rolePermissions
        )) {

            const permissionIds = rolePermissionNames.map(
                (permissionName) => permissionMap[permissionName]
            );

            await Role.findOneAndUpdate(
                {
                    name: roleName,
                    organizationId: organization._id
                },
                {
                    name: roleName,
                    organizationId: organization._id,
                    permissions: permissionIds
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }
    }

    console.log("RBAC roles and permissions seeded successfully");
};

module.exports = {
    seedRBAC
};