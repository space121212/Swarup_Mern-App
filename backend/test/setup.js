require("dotenv").config({ path: ".env.test" });

const mongoose = require("mongoose");
const connectDB = require("../src/config/db.js");

beforeAll(async () => {
    if (!process.env.TEST_MONGO_DB_URL) {
        throw new Error("TEST_MONGO_DB_URL is missing");
    }

    process.env.MONGO_DB_URL =
        process.env.TEST_MONGO_DB_URL;

    await connectDB();
});

afterAll(async () => {
    await mongoose.disconnect();
});