import http from "http";
import express from "express";
import { Server } from "socket.io";
import { registerMessageHandlers } from "./message.socket.js";
import { registerGroupHandlers } from "./group.socket.js";
import { registerReadHandlers } from "./read.socket.js";
import { registerCallHandlers } from "./call.socket.js";

import dotenv from "dotenv";

dotenv.config();

const defaultAllowedOrigins = [
    "http://localhost:5173",
    "https://real-time-chat-with-call-feature.vercel.app",
];

const clientUrls = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/+$/, ""))
    : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...clientUrls])).filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowed origins
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked origin: ${origin}`));
        },
        credentials: true
    }
});

export const userSocketMap = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId != undefined) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    registerMessageHandlers(io, socket, userSocketMap);
    registerGroupHandlers(io, socket, userSocketMap);
    registerReadHandlers(io, socket, userSocketMap);
    registerCallHandlers(io, socket, userSocketMap);

    socket.on("disconnect", () => {
        console.log("user disconnected success");
        if (userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, server, io };
