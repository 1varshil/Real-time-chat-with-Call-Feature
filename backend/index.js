import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import messageRouter from "./routes/message.routes.js";
import groupRouter from "./routes/group.routes.js";
import { app, server } from "./socket/socket.js";

dotenv.config();

const port = process.env.PORT || 5000;



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter);
app.use("/api/user", userRouter);
app.use("/api/message",messageRouter);
app.use("/api/group", groupRouter);


app.get("/",(req,res)=> {
    res.send("Hello from Node");
    
})
const startServer = async () => {
    try {
        await connectDb();
        server.listen(port, () => {
            console.log("Server running on port", port);
        });
    } catch (error) {
        console.log("Server failed to start:", error.message);
    }
};

startServer();