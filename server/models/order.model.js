/*  pending → active → delivered → completed
                                 → disputed
            → cancelled*/
const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    package: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    deliveryDays: {
      type: Number,
      required: true,
    },
    revisions: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "delivered",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },
    requirements: {
      type: String,
      default: "",
    },
    deliveryFile: {
      type: String,
      default: "",
    },
    deliveryMessage: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
    }, 
    isReviewed: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
      type: String,
      default: "",
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });
module.exports = mongoose.model("Order", orderSchema);
