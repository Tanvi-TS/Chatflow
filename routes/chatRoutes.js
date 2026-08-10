const express = require("express");

const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");

// Create a new chat or open an existing one
router.get("/:userId", protect, chatController.createOrOpenChat);

// Open an existing conversation
router.get(
    "/conversation/:chatId",
    protect,
    chatController.openChat
);

module.exports = router;