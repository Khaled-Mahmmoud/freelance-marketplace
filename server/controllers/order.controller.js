const Order = require("../models/order.model");
const Gig = require("../models/gig.model");
const ApiError = require("../utils/ApiError");
const createOrder = async (req, res, next) => {
    try {
        if (req.user.role !== "client") {
            throw new ApiError(403, "Only clients can place orders");
        }
        const gig = await Gig.findById(req.params.gigId);
        if (!gig) {
            throw new ApiError(404, "Gig not found");
        }
        if (!gig.isActive) {
            throw new ApiError(400, "This gig is not available");
        }
        if (gig.seller.toString() === req.user._id.toString()) {
            throw new ApiError(400, "You cannot order your own gig");
        }
        const { package: selectedPackage, requirements } = req.body;
        const packageData = gig.packages[selectedPackage];
        if (!packageData || !packageData.price) {
            throw new ApiError(400, "Invalid package selected");
        }
        const order = await Order.create({
            buyer: req.user._id,
            seller: gig.seller,
            gig: gig._id,
            package: selectedPackage,
            price: packageData.price,
            deliveryDays: packageData.deliveryDays,
            revisions: packageData.revisions,
            requirements,
            status: "pending",
        });
        res.status(201).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};
const getMyOrders = async (req, res, next) => {
    try {
        const isSeller = req.query.seller === "true";
        const query = isSeller ? { seller: req.user._id } : { buyer: req.user._id };
        const orders = await Order.find(query)
            .populate("buyer", "username fullName avatar")
            .populate("seller", "username fullName avatar")
            .populate("gig", "title images packages")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("buyer", "username fullName avatar")
            .populate("seller", "username fullName avatar")
            .populate("gig", "title images packages");
        if (!order) {
            throw new ApiError(404, "Order not found");
        }
        if (
            order.buyer._id.toString() !== req.user._id.toString() &&
            order.seller._id.toString() !== req.user._id.toString()
        ) {
            throw new ApiError(403, "You do not have access to this order");
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};
const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            throw new ApiError(404, "Order not found");
        }
        const { status } = req.body;
        const userId = req.user._id.toString();
        const isBuyer = order.buyer.toString() === userId;
        const isSeller = order.seller.toString() === userId;

        if (status === "active") {
            if (!isSeller) {
                throw new ApiError(403, "Only seller can accept orders");
            }
            if (order.status !== "pending") {
                throw new ApiError(400, "Only pending orders can be accepted");
            }
            order.dueDate = new Date(
                Date.now() + order.deliveryDays * 24 * 60 * 60 * 1000
            );
        }
        if (status === "delivered") {
            if (!isSeller) {
                throw new ApiError(403, "Only seller can deliver orders");
            }
            if (order.status !== "active") {
                throw new ApiError(400, "Only active orders can be delivered");
            }
            order.deliveryMessage = req.body.deliveryMessage || "";
            order.deliveryFile = req.body.deliveryFile || "";
        }
        if (status === "completed") {
            if (!isBuyer) {
                throw new ApiError(403, "Only buyer can complete orders");
            }
            if (order.status !== "delivered") {
                throw new ApiError(400, "Only delivered orders can be completed");
            }
            await Gig.findByIdAndUpdate(order.gig, {$inc: { totalOrders: 1 },});
        }
        if (status === "cancelled") {
            if (!isBuyer && !isSeller) {
                throw new ApiError(403, "Not authorized");
            }
            if (!["pending", "active"].includes(order.status)) {
                throw new ApiError(400, "This order cannot be cancelled");
            }
            order.cancelReason = req.body.cancelReason || "";
        }
        if (status === "disputed") {
            if (!isBuyer) {
                throw new ApiError(403, "Only buyer can raise a dispute");
            }
            if (order.status !== "delivered") {
                throw new ApiError(400, "Only delivered orders can be disputed");
            }
            // ...................
        }
        order.status = status;
        await order.save();
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};
module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };