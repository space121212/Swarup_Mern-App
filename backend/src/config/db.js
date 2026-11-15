const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_DB_URL);

    console.log("Connected database:", mongoose.connection.name);
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