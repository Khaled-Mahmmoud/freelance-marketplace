const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { fullName, bio, skills } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -earnings -isBanned -isVerified"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, getUserProfile };