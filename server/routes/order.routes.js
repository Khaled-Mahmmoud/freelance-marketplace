const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
router.use(protect); // instead of adding protect to every single route

router.post("/:gigId", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
module.exports = router;
