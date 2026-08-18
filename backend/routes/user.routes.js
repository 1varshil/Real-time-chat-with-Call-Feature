import express from "express";
import { getCurrentUser, editProfile, getOtherUsers } from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.put("/profile", isAuth, upload.single("image"), editProfile);
userRouter.get("/other-users", isAuth, getOtherUsers);


export default userRouter;