import express from "express"
import { signUp,login,logout } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/signup",signUp);
authRouter.post("/login",login);
authRouter.get("/logout",logout);


export default authRouter;