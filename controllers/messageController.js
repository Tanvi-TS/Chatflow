const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
    try {

        const { chatId } = req.params;
        const { text } = req.body;

        if (!text || text.trim() === "") {
            req.flash("error", "Message cannot be empty.");
            return res.redirect(`/chat/conversation/${chatId}`);
        }

        const message = await Message.create({
            chat: chatId,
            sender: req.user.userId,
            text: text.trim(),
        });

        // Update last message
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
        });

        // Get sender information
        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "name");

        // Get Socket.IO instance
        const io = req.app.get("io");

        // Send message to everyone in this chat room
        io.to(chatId).emit("newMessage", populatedMessage);

        res.redirect(`/chat/conversation/${chatId}`);

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
            chat: chatId
        })
        .populate("sender", "name")
        .sort({ createdAt: 1 });

        res.json(messages);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Unable to fetch messages."
        });

    }
};