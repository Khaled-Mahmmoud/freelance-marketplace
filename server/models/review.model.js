const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
  },
  { timestamps: true }
);
reviewSchema.index({ gig: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ order: 1 }, { unique: true }); // one order can only have one review
module.exports = mongoose.model("Review", reviewSchema);
