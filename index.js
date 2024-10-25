
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
let activeUsers = new Map()

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
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

app.use('/uploads', express.static('public/uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', initMessageRoutes(io));

server.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});
