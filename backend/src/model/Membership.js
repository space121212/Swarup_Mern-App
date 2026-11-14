const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: ["active", "invited", "suspended"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

membershipSchema.index(
    { userId: 1, organizationId: 1 },
    { unique: true }
);

const Membership = mongoose.model(
    "Membership",
    membershipSchema
);

module.exports = Membership;