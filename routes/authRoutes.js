const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/login", authController.getLogin);
router.post("/login", authController.loginUser);

router.get("/register", authController.getRegister);
router.post("/register", authController.registerUser);

router.get("/dashboard", protect, authController.getDashboard);

router.get("/logout", authController.logoutUser);

module.exports = router;