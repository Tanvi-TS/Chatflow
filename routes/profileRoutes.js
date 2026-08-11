const express = require("express");

const router = express.Router();

const profileController = require("../controllers/profileController");

const { protect } = require("../middlewares/authMiddleware");


router.get(
    "/",
    protect,
    profileController.getProfile
);


router.get(
    "/edit",
    protect,
    profileController.getEditProfile
);


router.post(
    "/edit",
    protect,
    profileController.updateProfile
);


module.exports = router;