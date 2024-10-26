import dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./db/db.js";
import userRoutes from './routes/user.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import initMessageRoutes from './routes/message.routes.js';
import http from 'http';
import { Server } from 'socket.io';

let activeUsers = new Map();

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Cấu hình CORS để cho phép miền cụ thể
const allowedOrigins = ["https://chat-app-3u9n.onrender.com"];

// Cấu hình middleware CORS
app.use(cors((req, callback) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        callback(null, {
            origin: origin,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            credentials: true // Giữ cookie và thông tin xác thực
        });
    } else {
        callback(new Error("Not allowed by CORS"));
    }
}));

app.use(cookieParser());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // Cho phép miền cụ thể
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("userOnline", (userId) => {
        console.log(`User ${userId} is online with socket ID ${socket.id}`);

        activeUsers.set(userId, socket.id);

        io.emit("activeUsers", Array.from(activeUsers.keys()));
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);

        for (let [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                break;
            }
        }

        io.emit("activeUsers", Array.from(activeUsers.keys()));
    });
});

// Static file serving
app.use('/uploads', express.static('public/uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', initMessageRoutes(io));

// Start server
server.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});
