require("dotenv").config();

const connectDB = require("./config/db.js");
const {
    migrateMembershipRoles
} = require("./seed/migrateMembership.js");

const runMigration = async () => {
    try {
        await connectDB();

        await migrateMembershipRoles();

        console.log("Migration completed successfully");

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error.message);

        process.exit(1);
    }
};

runMigration();