const User = require("../models/User");

// Show profile
exports.getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/dashboard");
        }

        res.render("profile/profile", {
            user
        });

    } catch (error) {

        console.log(error);

        req.flash("error", "Unable to load profile.");
        res.redirect("/dashboard");

    }
};


// Show edit profile page
exports.getEditProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/dashboard");
        }

        res.render("profile/editProfile", {
            user
        });

    } catch (error) {

        console.log(error);

        req.flash("error", "Unable to load profile.");
        res.redirect("/profile");

    }
};


// Update profile
exports.updateProfile = async (req, res) => {
    try {

        const { name } = req.body;

        if (!name || name.trim() === "") {
            req.flash("error", "Name cannot be empty.");
            return res.redirect("/profile/edit");
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/dashboard");
        }

        user.name = name.trim();

        await user.save();

        req.flash("success", "Profile updated successfully.");

        res.redirect("/profile");

    } catch (error) {

        console.log(error);

        req.flash("error", "Unable to update profile.");

        res.redirect("/profile/edit");

    }
};