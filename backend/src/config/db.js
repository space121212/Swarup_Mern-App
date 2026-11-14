const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected database:", mongoose.connection.name);

    } catch (error) {
        console.error("MongoDB initial connection failed:", error.message);
        process.exit(1);
    }
};

mongoose.connection.on("connected", () => {
    
    console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
});

module.exports = connectDB;