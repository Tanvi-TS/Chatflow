# 💬 ChatFlow - Real-Time Messaging Application

A full-stack real-time messaging application with secured WebSocket authentication, live presence tracking, and persistent chat history - built with **Node.js, Express.js, MongoDB, EJS, Tailwind CSS, and Socket.IO**.

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Architecture](#️-architecture) • [Installation](#-installation) • [Project Structure](#-project-structure) • [API Endpoints](#-api-endpoints) • [Security](#-security-features) • [Future Enhancements](#-future-enhancements)

---

# 📖 About

ChatFlow is a full-stack real-time messaging platform that enables users to securely register, authenticate, discover other users, create one-to-one conversations, and exchange messages instantly.

The application combines **REST APIs** for authentication, chat management, and message persistence with **Socket.IO** for real-time communication and online/offline presence.

The backend follows a modular **MVC-style architecture**, separating routes, controllers, middleware, and database models for maintainability.

---

# ✨ Key Highlights

* 💬 Real-time one-to-one messaging
* ⚡ Socket.IO-powered instant message delivery
* 🟢 Live online/offline user presence
* 🔐 JWT-based authentication
* 🍪 HTTP-only cookie-based authentication
* 🛡️ Protected routes and chat authorization
* 💾 MongoDB-based persistent message history
* 👤 User profiles and account management
* 📱 Responsive WhatsApp-inspired interface
* 🎨 Tailwind CSS modern UI
* 🏗️ Modular MVC-style backend architecture
* ☁️ Production-ready deployment

---

# 🚀 Features

## 🔑 Authentication & Authorization

* ✅ User registration
* ✅ User login and logout
* ✅ Password hashing using bcrypt
* ✅ JWT-based authentication
* ✅ HTTP-only authentication cookies
* ✅ Protected routes
* ✅ Token expiration
* ✅ Unauthorized access prevention
* ✅ Secure Socket.IO authentication

---

## 💬 Real-Time Messaging

* ✅ One-to-one conversations
* ✅ Send messages without page refresh
* ✅ Instant message delivery using Socket.IO
* ✅ Persistent messages stored in MongoDB
* ✅ Message history loading
* ✅ Automatic scroll-to-bottom
* ✅ Sender-aware message alignment
* ✅ Message timestamps
* ✅ Empty conversation state
* ✅ Message validation
* ✅ Prevention of empty messages

---

## 🟢 Online / Offline Presence

ChatFlow maintains a server-side map of connected users to provide real-time presence information.

```text
User ID → Socket ID
```

* ✅ Online status detection
* ✅ Offline status detection
* ✅ Socket connection/disconnection handling
* ✅ Real-time presence updates
* ✅ User-specific online status

---

## 👥 Chat Management

* ✅ Start one-to-one conversations
* ✅ Reuse existing conversations
* ✅ Prevent duplicate conversations
* ✅ Store chat participants using MongoDB references
* ✅ Track the latest message
* ✅ Participant-based chat authorization
* ✅ Protected conversation routes

---

## 👤 User Profile

* ✅ View profile
* ✅ Edit profile
* ✅ User information management
* ✅ Protected profile routes
* ✅ Account settings

---

## 🎨 User Interface

* ✅ Modern WhatsApp-inspired interface
* ✅ Responsive dashboard
* ✅ Conversation sidebar
* ✅ Chat header with user status
* ✅ Message bubbles
* ✅ Responsive message area
* ✅ Profile management interface
* ✅ Settings interface
* ✅ Flash notifications
* ✅ Tailwind CSS styling

---

# ⚡ Real-Time Communication Flow

ChatFlow uses **REST APIs + Socket.IO** together.

```text
User types message
        ↓
Frontend captures message
        ↓
POST /message/:chatId
        ↓
Authentication Middleware
        ↓
Validate Chat + User Authorization
        ↓
Create Message in MongoDB
        ↓
Update Chat.lastMessage
        ↓
Emit Socket.IO Event
        ↓
io.to(chatId).emit("newMessage")
        ↓
Connected clients receive event
        ↓
Message rendered instantly
```

This architecture combines the reliability of **database-backed REST APIs** with the responsiveness of **real-time Socket.IO communication**.

---

# 🔐 Socket.IO Security

Socket connections are authenticated before being established.

```text
Client connects to Socket.IO
        ↓
Server reads JWT from HTTP-only cookie
        ↓
JWT verification
        ↓
Authenticated userId attached to socket
        ↓
Socket connection accepted
```

When a user attempts to join a chat room, the server verifies that the authenticated user is actually a participant in that conversation.

```text
joinChat(chatId)
        ↓
Find chat in MongoDB
        ↓
Check participants[]
        ↓
Is user a participant?
        ↓
   YES → socket.join(chatId)
   NO  → Reject access
```

This prevents unauthorized users from accessing private chat rooms.

---

# 🗄️ Database Design

ChatFlow uses **MongoDB with Mongoose**.

The application contains three primary collections:

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Chat          Message
 │              │
 │              │
 └──────►───────┘
```

### User

```text
User
├── name
├── email
├── password
└── timestamps
```

### Chat

```text
Chat
├── participants[] → User
├── lastMessage    → Message
└── timestamps
```

### Message

```text
Message
├── chat   → Chat
├── sender → User
├── text
└── timestamps
```

Mongoose references are used to connect users, chats, and messages.

---

# 🛠️ Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## Frontend

* EJS
* EJS Layouts
* Tailwind CSS v4
* Vanilla JavaScript
* HTML5

## Real-Time Communication

* Socket.IO

## Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt
* HTTP-only cookies
* Express middleware
* Cookie Parser
* Express Session
* Connect Flash

## Development Tools

* Nodemon
* dotenv
* npm

---

# 🏗️ Architecture

ChatFlow follows a modular **MVC-style architecture**.

```text
                    ┌─────────────────┐
                    │     Browser     │
                    │ EJS + JS + CSS  │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
              REST API              Socket.IO
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐      ┌─────────────────┐
        │     Routes      │      │ Socket Server   │
        └────────┬────────┘      └────────┬────────┘
                 │                        │
                 ▼                        │
        ┌─────────────────┐               │
        │   Middleware    │               │
        │ JWT Protection  │               │
        └────────┬────────┘               │
                 │                        │
                 ▼                        │
        ┌─────────────────┐               │
        │   Controllers   │◄──────────────┘
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Mongoose Models  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │     MongoDB     │
        └─────────────────┘
```

---

# 📁 Project Structure

```text
Chatflow/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── chatController.js
│   ├── homeController.js
│   ├── messageController.js
│   ├── profileController.js
│   └── settingsController.js
│
├── middlewares/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Chat.js
│   └── Message.js
│
├── routes/
│   ├── indexRoutes.js
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   ├── messageRoutes.js
│   ├── profileRoutes.js
│   └── settingsRoutes.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── socket.js
│   └── src/
│       └── input.css
│
├── views/
│   ├── auth/
│   ├── chat/
│   ├── dashboard/
│   ├── profile/
│   ├── settings/
│   ├── layouts/
│   └── partials/
│
├── app.js
├── package.json
├── package-lock.json
├── .env
└── README.md
```

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/Tanvi-TS/Chatflow.git
cd Chatflow
```

## Install Dependencies

```bash
npm install
```

## Create `.env`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
PORT=3000
NODE_ENV=development
```

> Never commit your `.env` file or expose secret keys publicly.

---

# ▶️ Run the Application

## Development Mode

```bash
npm run dev
```

## Production Mode

```bash
npm start
```

The application runs at:

```text
http://localhost:3000
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | `/login`     | Login page          |
| POST   | `/login`     | Authenticate user   |
| GET    | `/register`  | Registration page   |
| POST   | `/register`  | Create user account |
| GET    | `/logout`    | Logout user         |
| GET    | `/dashboard` | User dashboard      |

---

## Chat

| Method | Endpoint                     | Description                    |
| ------ | ---------------------------- | ------------------------------ |
| GET    | `/chat/:userId`              | Create or open one-to-one chat |
| GET    | `/chat/conversation/:chatId` | Open existing conversation     |

---

## Messages

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| GET    | `/message/:chatId` | Fetch conversation messages |
| POST   | `/message/:chatId` | Send a new message          |

---

## Profile

| Method | Endpoint        | Description    |
| ------ | --------------- | -------------- |
| GET    | `/profile`      | View profile   |
| GET    | `/profile/edit` | Edit profile   |
| POST   | `/profile/edit` | Update profile |

---

## Settings

| Method | Endpoint    | Description      |
| ------ | ----------- | ---------------- |
| GET    | `/settings` | Account settings |

---

# 🔒 Security Features

* 🔐 Password hashing using bcrypt
* 🎫 JWT-based authentication
* 🍪 HTTP-only authentication cookies
* ⏱️ JWT expiration
* 🛡️ Protected Express routes
* 👥 Chat participant authorization
* 🔌 Authenticated Socket.IO connections
* 🚫 Unauthorized Socket.IO room access prevention
* ✅ MongoDB ObjectId validation
* ✂️ Message length validation
* 🚫 Empty-message validation
* 🔒 Secure cookie configuration in production

---

# 🧠 Important Engineering Decisions

### REST + Socket.IO

REST APIs handle operations requiring persistence and request-response semantics:

* Authentication
* Fetching messages
* Creating chats
* Sending messages
* Profile updates

Socket.IO handles low-latency real-time functionality:

* Real-time message delivery
* Online status
* Offline status
* Chat room communication

---

### Chat Rooms

Each conversation uses its MongoDB `chatId` as its Socket.IO room.

```text
Chat ID
   ↓
socket.join(chatId)
   ↓
User A ───────┐
              │
          Chat Room
              │
User B ───────┘
```

When a message is sent:

```javascript
io.to(chatId).emit("newMessage", message);
```

Only users connected to that conversation receive the real-time event.

---

### Persistent Message History

Messages are persisted in MongoDB rather than relying on Socket.IO for storage.

```text
Message
├── chat
├── sender
├── text
└── createdAt
```

When a conversation is opened, the frontend fetches the stored messages through:

```text
GET /message/:chatId
```

This ensures that messages remain available after page reloads or socket disconnections.

---

# 🎯 Future Enhancements

* ⌨️ Typing indicators
* 🔔 Unread message counts
* 💬 Last-message preview
* 📎 File and image messaging
* 🎤 Voice messages
* 📞 Audio/video calling
* 😊 Emoji reactions
* 🗑️ Message deletion
* ✏️ Message editing
* 🔍 User and conversation search
* 🌙 Dark mode
* 🔔 Push notifications
* 👥 Group conversations

---

# 👩‍💻 Author

**Tanvi Saxena**

* GitHub: [Tanvi-TS](https://github.com/Tanvi-TS)

---

# ❤️ Built With

* Node.js
* Express.js
* MongoDB
* Mongoose
* EJS
* Tailwind CSS
* Socket.IO
* JWT
* bcrypt

---

⭐ If you found this project helpful, consider giving it a star!
