import http from "http";
import express from "express";
import { Server } from "socket.io";
import { registerMessageHandlers } from "./message.socket.js";
import { registerGroupHandlers } from "./group.socket.js";
import { registerReadHandlers } from "./read.socket.js";
import { registerCallHandlers } from "./call.socket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
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
