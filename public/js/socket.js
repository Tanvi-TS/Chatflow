const socket = io();

const chatContainer = document.querySelector("[data-chat-id]");
const chatId = chatContainer?.dataset.chatId;
const currentUserId = chatContainer?.dataset.userId;

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesList = document.getElementById("messagesList");

const receiverId = chatContainer?.dataset.receiverId;
const userStatus = document.getElementById("userStatus");


/* -----------------------------
   Socket Connection
----------------------------- */

socket.on("connect", () => {

    console.log("🟢 Connected to Socket.IO:", socket.id);

    // Tell server that this user is online.
    // Server gets the REAL userId from the JWT.
    if (currentUserId) {
        socket.emit("userOnline");
    }

    // Ask server to join this chat.
    // Server will verify that the user belongs to it.
    if (chatId) {
        socket.emit("joinChat", chatId);
    }

});


socket.on("disconnect", () => {

    console.log("🔴 Disconnected from Socket.IO");

});


/* -----------------------------
   Load Existing Messages
----------------------------- */

async function loadMessages() {

    if (!chatId || !messagesList) {
        return;
    }

    try {

        const response = await fetch(`/message/${chatId}`);

        if (!response.ok) {
            throw new Error("Unable to fetch messages.");
        }

        const messages = await response.json();

        messagesList.innerHTML = "";

        if (messages.length === 0) {

            messagesList.innerHTML = `
                <div class="empty-chat flex h-full items-center justify-center">
                    <div class="rounded-xl bg-white px-6 py-4 text-center shadow-sm ring-1 ring-slate-200">
                        <p class="text-sm text-slate-500">
                            No messages yet.
                        </p>

                        <p class="mt-1 text-sm text-slate-400">
                            Start your conversation 👋
                        </p>
                    </div>
                </div>
            `;

            return;
        }

        messages.forEach(message => {
            renderMessage(message);
        });

        scrollToBottom();

    } catch (error) {

        console.error("❌ Failed to load messages:", error);

    }

}


/* -----------------------------
   Render Message
----------------------------- */

function renderMessage(message) {

    const senderId = message.sender._id.toString();

    const isMine = senderId === currentUserId;

    const messageWrapper = document.createElement("div");

    messageWrapper.className = isMine
        ? "flex justify-end"
        : "flex justify-start";

    const bubble = document.createElement("div");

    bubble.className = isMine
        ? "max-w-xs rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm"
        : "max-w-xs rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200";

    const textElement = document.createElement("p");

    textElement.className = "break-words";

    textElement.textContent = message.text;

    const timeElement = document.createElement("p");

    timeElement.className = isMine
        ? "mt-1 text-right text-[10px] text-indigo-100"
        : "mt-1 text-right text-[10px] text-slate-400";

    timeElement.textContent = new Date(
        message.createdAt
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    bubble.appendChild(textElement);
    bubble.appendChild(timeElement);

    messageWrapper.appendChild(bubble);

    messagesList.appendChild(messageWrapper);

}


/* -----------------------------
   Scroll to Bottom
----------------------------- */

function scrollToBottom() {

    const messageArea = document.getElementById("messageArea");

    if (messageArea) {
        messageArea.scrollTop = messageArea.scrollHeight;
    }

}


/* -----------------------------
   Send Message
----------------------------- */

if (messageForm) {

    messageForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const text = messageInput.value.trim();

        if (!text) {
            return;
        }

        try {

            const response = await fetch(`/message/${chatId}`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text
                })

            });

            if (!response.ok) {
                throw new Error("Unable to send message.");
            }

            messageInput.value = "";
            messageInput.focus();

        } catch (error) {

            console.error("❌ Message sending failed:", error);

        }

    });

}


/* -----------------------------
   Receive New Message
----------------------------- */

socket.on("newMessage", (message) => {

    console.log("💬 New message received:", message);

    if (!messagesList) {
        return;
    }

    // Remove empty state if present
    const emptyChat = messagesList.querySelector(".empty-chat");

    if (emptyChat) {
        emptyChat.remove();
    }

    renderMessage(message);

    scrollToBottom();

});


/* -----------------------------
   Load Messages on Page Open
----------------------------- */

loadMessages();

socket.on("userOnline", (userId) => {

    if (userId === receiverId && userStatus) {

        userStatus.textContent = "Online";
        userStatus.classList.remove("text-slate-400");
        userStatus.classList.add("text-green-600");

    }

});

socket.on("userOffline", (userId) => {

    if (userId === receiverId && userStatus) {

        userStatus.textContent = "Offline";
        userStatus.classList.remove("text-green-600");
        userStatus.classList.add("text-slate-400");

    }

});