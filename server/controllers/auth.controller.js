const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
/* jwt.sign(Payload, secret, options)
Payload => { id } → data you want to store inside the token (e.g., user ID)
Secret => secret → a private key used to sign the token (like a signature)
Options => { expiresIn: "1h" } → extra settings (like expiration time) */
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, role } = req.body; 
    const existingUser = await User.findOne({
      $or: [{ email }, { username }], 
    });
    if (existingUser) {
      throw new ApiError(400, "Email or username already exists");
    }
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role,
    });
    
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // if (!user) {
    //   return next(new ApiError(401, "Invalid email or password"));
    // }
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }
    if (user.isBanned) {
      throw new ApiError(403, "Your account has been banned");
    }
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};


module.exports = { register, login, getMe };
