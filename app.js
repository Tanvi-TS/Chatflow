const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const session = require("express-session");
const flash = require("connect-flash");

app.use(
    session({
        secret: "chatflow-secret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

// EJS Layouts
app.use(expressLayouts);

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});