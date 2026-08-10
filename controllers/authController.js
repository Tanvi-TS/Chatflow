const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Render Pages

exports.getLogin = (req, res) => {
  res.render("auth/login");
};

exports.getRegister = (req, res) => {
  res.render("auth/register");
};

// Register User

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.flash("error", "Email already exists.");
      return res.redirect("/register");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    req.flash("success", "Registration successful. Please login.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong.");
    res.redirect("/register");
  }
};

exports.loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        req.flash("success", `Welcome back, ${user.name}!`);

        res.redirect("/dashboard");

    } catch (error) {

        console.error(error);

        req.flash("error", "Something went wrong.");

        res.redirect("/login");

    }
};

exports.logoutUser = (req, res) => {

    res.clearCookie("token");

    req.flash("success", "Logged out successfully.");

    res.redirect("/login");

};

exports.getDashboard = async (req, res) => {
    try {

        const user = await User.findById(req.user.userId);

        const users = await User.find({
            _id: { $ne: req.user.userId }
        });

        res.render("dashboard/dashboard", {
            user,
            users
        });

    } catch (error) {

        console.log(error);

        req.flash("error", "Something went wrong.");

        res.redirect("/login");

    }
};
