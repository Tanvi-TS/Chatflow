const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

exports.createOrOpenChat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      req.flash("error", "Invalid user.");
      return res.redirect("/dashboard");
    }

    const currentUser = req.user.userId;
    const otherUser = req.params.userId;

    // Look for an existing one-to-one chat
    let chat = await Chat.findOne({
      participants: {
        $all: [currentUser, otherUser],
      },
    });

    // If no chat exists, create one
    if (!chat) {
      chat = await Chat.create({
        participants: [currentUser, otherUser],
      });
    }

    // Redirect to conversation page
    res.redirect(`/chat/conversation/${chat._id}`);
  } catch (error) {
    console.log(error);

    req.flash("error", "Unable to open chat.");

    res.redirect("/dashboard");
  }
};

// Open an existing conversation
// Open an existing conversation
exports.openChat = async (req, res) => {
  try {
    // Validate MongoDB chat ID
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      req.flash("error", "Invalid chat.");
      return res.redirect("/dashboard");
    }

    const currentUser = await User.findById(req.user.userId);

    const chat = await Chat.findById(req.params.chatId).populate(
      "participants",
      "name email",
    );

    if (!chat) {
      req.flash("error", "Chat not found.");
      return res.redirect("/dashboard");
    }

    // Check whether the logged-in user belongs to this chat
    const isParticipant = chat.participants.some(
      (participant) =>
        participant._id.toString() === req.user.userId.toString(),
    );

    if (!isParticipant) {
      req.flash("error", "You are not authorized to access this chat.");
      return res.redirect("/dashboard");
    }

    // Find the other participant
    const receiver = chat.participants.find(
      (participant) =>
        participant._id.toString() !== req.user.userId.toString(),
    );

    // Get all messages for this chat
    const messages = await Message.find({
      chat: chat._id,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name");

    res.render("chat/chat", {
      user: currentUser,
      chat,
      receiver,
      messages,
    });
  } catch (error) {
    console.log(error);

    req.flash("error", "Something went wrong.");

    res.redirect("/dashboard");
  }
};
