const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const http = require("http");
const { Server } = require("socket.io");

const Chat = require("./models/Chat");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const server = http.createServer(app);

const io = new Server(server);

app.set("io", io);

const onlineUsers = new Map();

// ------------------------------------
// Socket.IO Authentication
// ------------------------------------

io.use((socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
      return next(new Error("Authentication required."));
    }

    // Find token inside cookies
    const tokenCookie = cookies
      .split(";")
      .find((cookie) => cookie.trim().startsWith("token="));

    if (!tokenCookie) {
      return next(new Error("Authentication required."));
    }

    const token = tokenCookie.split("=").slice(1).join("=").trim();

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store authenticated user on socket
    socket.userId = decoded.userId.toString();

    next();
  } catch (error) {
    console.log("❌ Socket authentication failed.");

    next(new Error("Invalid authentication."));
  }
});

// ------------------------------------
// Socket.IO Connection
// ------------------------------------

io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.userId} | Socket: ${socket.id}`);

  // --------------------------------
  // User Online
  // --------------------------------

  socket.on("userOnline", () => {
    const userId = socket.userId;

    onlineUsers.set(userId, socket.id);

    socket.broadcast.emit("userOnline", userId);

    console.log(`🟢 User ${userId} is online`);
  });

  // --------------------------------
  // Join Chat
  // --------------------------------

  socket.on("joinChat", async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        console.log(`❌ Chat ${chatId} does not exist.`);

        return;
      }

      // Check whether authenticated user
      // belongs to this chat

      const isParticipant = chat.participants.some(
        (participant) => participant.toString() === socket.userId,
      );

      if (!isParticipant) {
        console.log(
          `🚫 User ${socket.userId} tried to join unauthorized chat ${chatId}`,
        );

        return;
      }

      // User is authorized
      socket.join(chatId);

      console.log(`👥 ${socket.userId} joined chat: ${chatId}`);
    } catch (error) {
      console.log("❌ Error joining chat:", error.message);
    }
  });

  // --------------------------------
  // Disconnect
  // --------------------------------

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.userId}`);

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
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

// ------------------------------------
// 404 - Page Not Found
// ------------------------------------

app.use((req, res) => {
  res.status(404).render("404");
});

// ------------------------------------
// Global Error Handler
// ------------------------------------

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  req.flash("error", "Something went wrong.");

  res.redirect("/");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
