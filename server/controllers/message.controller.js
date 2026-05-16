const { Conversation, Message } = require("../models/message.model");
const ApiError = require("../utils/ApiError");

const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
      });
    }
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};
const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate("participants", "username fullName avatar")
      .sort({ lastMessageAt: -1 });
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId
    );
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }
    if (!conversation.participants.includes(req.user._id)) {
      throw new ApiError(403, "You are not part of this conversation");
    }
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "username fullName avatar")
      .sort({ createdAt: 1 });

    // Update many messages at once
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true }
    );
    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
const sendMessage = async (req, res, next) => {
  try {
    const { text, file } = req.body;
    const conversation = await Conversation.findById(
      req.params.conversationId
    );
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }
    if (!conversation.participants.includes(req.user._id)) {
      throw new ApiError(403, "You are not part of this conversation");
    }
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      file: file || "",
    });
    await message.populate("sender", "username fullName avatar");
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};