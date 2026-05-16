const express = require("express");
const router = express.Router();
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} = require("../controllers/message.controller");
const { protect } = require("../middlewares/auth.middleware");
router.use(protect);
router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getMyConversations);
router.get("/conversations/:conversationId", getMessages);
router.post("/conversations/:conversationId", sendMessage);
module.exports = router;
