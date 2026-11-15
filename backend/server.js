console.log("[DEBUG] SERVER FILE STARTED");
require("dotenv").config();

const app = require("./src/App.js");
const connectDB = require("./src/config/db.js");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5500;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Keep your existing graceful shutdown implementation here.
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

// Step 5: Start the application
startServer();
