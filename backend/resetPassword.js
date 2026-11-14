
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/model/User.js");

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);

        const email = "rajesh@gamil.com";
        const newPassword = "DevTest@12345";

        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found in the connected database.");
            return;
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        console.log("Password reset successfully.");
        console.log("Email:", email);
        console.log("Use the new password you set in this script.");
    } catch (error) {
        console.error("Password reset failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

resetPassword();
