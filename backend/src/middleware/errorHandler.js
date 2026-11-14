
const errorHandler = (err, req, res, next) => {

    // Log the real error inside the backend container
    console.error("[GLOBAL ERROR HANDLER]", {
        method: req.method,
        url: req.originalUrl,
        message: err.message,
        stack: err.stack
    });

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? "Internal server error"
            : err.message
    });
};

module.exports = errorHandler;
