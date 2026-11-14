console.log("[DEBUG] SERVER FILE STARTED");
require("dotenv").config();

const app = require("./src/App.js");
const connectDB = require("./src/config/db.js");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5500;

const startServer = async () => {
    try {
        // Step 1: Connect to MongoDB
        await connectDB();

        // Step 2: Start the HTTP server
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Prevent multiple shutdowns from running simultaneously
        let isShuttingDown = false;

        // Step 3: Graceful shutdown
        const shutdown = (signal) => {
            if (isShuttingDown) {
                return;
            }

            isShuttingDown = true;

            console.log(`${signal} received. Shutting down...`);

            // Stop accepting new requests
            server.close(async (error) => {
                try {
                    // Close MongoDB connection
                    await mongoose.connection.close();

                    console.log("MongoDB connection closed");

                    process.exit(error ? 1 : 0);
                } catch (shutdownError) {
                    console.error(
                        "Shutdown failed:",
                        shutdownError.message
                    );

                    process.exit(1);
                }
            });

            // Prevent shutdown from waiting indefinitely
            setTimeout(() => {
                console.error("Shutdown timed out");
                process.exit(1);
            }, 10000).unref();
        };

        // Step 4: Listen for termination signals
        process.once("SIGTERM", () => shutdown("SIGTERM"));
        process.once("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

// Step 5: Start the application
startServer();
