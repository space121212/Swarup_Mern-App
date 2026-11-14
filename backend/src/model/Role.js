const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },

        permissions:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'Permission'
            }

        ]
    },
    {
        timestamps: true
    }
);

roleSchema.index(
    { organizationId: 1, name: 1 },
    { unique: true }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;