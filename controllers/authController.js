const bcrypt = require("bcrypt");
const User = require("../models/User");

// Render Pages

exports.getLogin = (req, res) => {
  res.render("login");
};

exports.getRegister = (req, res) => {
  res.render("register");
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
