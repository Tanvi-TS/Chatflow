const express = require("express");

const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const messageController = require("../controllers/messageController");

router.post(
    "/:chatId",
    protect,
    messageController.sendMessage
);

router.get(
    "/:chatId",
    protect,
    messageController.getMessages
);

module.exports = router;