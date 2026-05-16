const Review = require("../models/review.model");
const Order = require("../models/order.model");
const Gig = require("../models/gig.model");
const ApiError = require("../utils/ApiError");
const createReview = async (req, res, next) => {
  try {
    const { rating, comment, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    if (order.buyer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the buyer can leave a review");
    }
    if (order.status !== "completed") {
      throw new ApiError(400, "You can only review completed orders");
    }
    if (order.isReviewed) {
      throw new ApiError(400, "You already reviewed this order");
    }
    const review = await Review.create({
      reviewer: req.user._id,
      gig: order.gig,
      order: orderId,
      rating,
      comment,
    });
    order.isReviewed = true;
    await order.save();
    const allReviews = await Review.find({ gig: order.gig });
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

    await Gig.findByIdAndUpdate(order.gig, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews, // EX: 4.666 multiply by 10 => 46.66, round => 47, then divide by 10 => 4.7
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
const getGigReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate("reviewer", "username fullName avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }
    if (review.reviewer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You can only delete your own reviews");
    }
    await Review.findByIdAndDelete(req.params.id);
    const allReviews = await Review.find({ gig: review.gig });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 ? allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
    await Gig.findByIdAndUpdate(review.gig, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getGigReviews, deleteReview };
