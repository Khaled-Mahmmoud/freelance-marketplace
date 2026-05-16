const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getUserProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/:id", getUserProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;