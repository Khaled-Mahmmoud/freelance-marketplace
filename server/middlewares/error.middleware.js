// Express knows this is an error middleware because it has 4 parameters. 
// When you call next(error) anywhere in the app, Express automatically jumps to this function.
const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    // CastError — happens when you pass an invalid MongoDB ID.
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    // err.code === 11000 — this is MongoDB's error code for duplicate unique fields. 
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired, please login again";
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorMiddleware;