import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { allGroups, createGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create-group", isAuth, createGroup);

router.get("/get-groups", isAuth, allGroups);

export default router;
