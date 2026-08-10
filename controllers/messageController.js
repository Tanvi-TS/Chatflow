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

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
        });

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
            .sort({ createdAt: 1 })
            .populate("sender", "name");

        return messages;

    } catch (error) {

        console.log(error);

        return [];

    }
};