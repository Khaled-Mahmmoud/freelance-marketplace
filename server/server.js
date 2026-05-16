const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const gigRoutes = require("./routes/gig.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const messageRoutes = require("./routes/message.routes");

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(errorMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API is running..." });
    // When you visit http://localhost:5173/ , you'll see this message.
});
const onlineUsers = new Map();
// Key is userId, value is socketId. user connects => add, user disconnects => remove.

// fires every time a new client connects. Each client gets a unique socket.id.
io.on("connection", (socket) => {
    if (process.env.NODE_ENV === "development")
        console.log("User connected:", socket.id);

    socket.on("userOnline", (userId) => { 
        onlineUsers.set(userId, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys())); 
        // sends event to ALL connected clients.
    });
    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
    });
    socket.on("leaveConversation", (conversationId) => {
        socket.leave(conversationId);
    });
    socket.on("sendMessage", (message) => {
        io.to(message.conversationId).emit("newMessage", message);
    });
    socket.on("typing", ({ conversationId, userId }) => {
        socket.to(conversationId).emit("userTyping", userId);
    });
    socket.on("stopTyping", ({ conversationId }) => {
        socket.to(conversationId).emit("userStoppedTyping");
    });
    socket.on("disconnect", () => {
        onlineUsers.forEach((socketId, userId) => {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
            }
        });
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        if (process.env.NODE_ENV === "development")
            console.log("User disconnected:", socket.id);
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    if (process.env.NODE_ENV === "development")
        console.log(`Server running on port ${PORT}`);
});
