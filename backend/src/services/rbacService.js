const Role = require("../model/Role.js");
const Permission = require("../model/Permission.js");

const rolePermissions = {
    Owner: [
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

const createOrganizationRoles = async (
    organizationId,
    session
) => {
    const permissionNames = [
        ...new Set(
            Object.values(rolePermissions).flat()
        )
    ];

    const permissions = await Permission.find(
        {
            name: { $in: permissionNames }
        },
        null,
        { session }
    );

    const permissionMap = {};

    for (const permission of permissions) {
        permissionMap[permission.name] = permission._id;
    }

    const roles = {};

    for (const [roleName, permissionNamesForRole] of Object.entries(
        rolePermissions
    )) {
        const permissionIds = permissionNamesForRole.map(
            (permissionName) => permissionMap[permissionName]
        );

        const role = await Role.create(
            [
                {
                    name: roleName,
                    organizationId,
                    permissions: permissionIds
                }
            ],
            { session }
        );

        roles[roleName] = role[0];
    }

    return roles;
};

module.exports = {
    createOrganizationRoles
};