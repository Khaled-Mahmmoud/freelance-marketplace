const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1]; // "Bearer token"
        }
        if (!token) {
            throw new ApiError(401, "Not authorized, no token");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            throw new ApiError(401, "User no longer exists");
        }

        if (user.isBanned) {
            throw new ApiError(403, "Your account has been banned");
        }

        req.user = user; 
        next();
    } catch (error) {
        next(error);
    }
};
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "You do not have permission to do this"));
        }
        next();
    };
};
module.exports = { protect, restrictTo };
