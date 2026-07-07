const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            req.flash("error", "Please login first.");
            return res.redirect("/login");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        req.flash("error", "Session expired. Please login again.");

        return res.redirect("/login");

    }

};