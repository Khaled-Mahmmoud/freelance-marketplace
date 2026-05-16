const express = require("express");
const router = express.Router();
const {
  createReview,
  getGigReviews,
  deleteReview,
} = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");
router.get("/:gigId", getGigReviews);
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);
module.exports = router;
