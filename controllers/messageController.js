const mongoose = require("mongoose");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    // Validate MongoDB chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      req.flash("error", "Invalid chat.");
      return res.redirect("/dashboard");
    }

    // Validate message
    if (!text || text.trim() === "") {
      req.flash("error", "Message cannot be empty.");
      return res.redirect(`/chat/conversation/${chatId}`);
    }

    // Maximum message length
    if (text.trim().length > 2000) {
      req.flash("error", "Message is too long.");
      return res.redirect(`/chat/conversation/${chatId}`);
    }

    // Find chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      req.flash("error", "Chat not found.");
      return res.redirect("/dashboard");
    }

    // Check whether logged-in user belongs to this chat
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user.userId.toString(),
    );

    if (!isParticipant) {
      req.flash(
        "error",
        "You are not authorized to send messages in this chat.",
      );

      return res.redirect("/dashboard");
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      sender: req.user.userId,
      text: text.trim(),
    });

    // Update last message
    // Update last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    // Populate sender before sending through Socket.IO
    await message.populate("sender", "name");

    // Get Socket.IO instance
    const io = req.app.get("io");

    // Send message to everyone inside this chat room
    io.to(chatId).emit("newMessage", message);

    res.status(200).json({
      success: true,
      message,
    });
    
    // res.redirect(`/chat/conversation/${chatId}`);
  } catch (error) {
    console.log(error);

    req.flash("error", "Unable to send message.");

    res.redirect("/dashboard");
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({
      chat: chatId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Unable to fetch messages.",
    });
  }
};
