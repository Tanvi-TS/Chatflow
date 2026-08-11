const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.set("io", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("userOnline", (userId) => {
    const id = userId.toString();

    onlineUsers.set(id, socket.id);

    socket.broadcast.emit("userOnline", id);

    console.log(`🟢 User ${id} is online`);
  });

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);

    console.log(`👥 ${socket.id} joined chat: ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);

        socket.broadcast.emit("userOffline", userId);

        console.log(`🔴 User ${userId} is offline`);

        break;
      }
    }
  });
});

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
  }),
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
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/profile", profileRoutes);
app.use("/settings", settingsRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
