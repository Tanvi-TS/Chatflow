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
            return res.send("Email already registered.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong.");
    }
};