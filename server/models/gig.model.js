const mongoose = require("mongoose");
const gigSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "web-development",
        "mobile-development",
        "design",
        "writing",
        "marketing",
        "video",
        "music",
        "data",
        "other",
      ],
    },
    packages: {
      basic: {
        name: { type: String, default: "Basic" },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 5 },
        deliveryDays: { type: Number, required: true, min: 1 },
        revisions: { type: Number, default: 1 },
      },
      standard: {
        name: { type: String, default: "Standard" },
        description: { type: String },
        price: { type: Number },
        deliveryDays: { type: Number },
        revisions: { type: Number, default: 2 },
      },
      premium: {
        name: { type: String, default: "Premium" },
        description: { type: String },
        price: { type: Number },
        deliveryDays: { type: Number },
        revisions: { type: Number, default: 3 },
      },
    },
    images: [{ type: String }],
    tags: [{ type: String }],
    requirements: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
gigSchema.index({ title: "text", description: "text", tags: "text" });
gigSchema.index({ category: 1 });
gigSchema.index({ seller: 1 });
module.exports = mongoose.model("Gig", gigSchema);
