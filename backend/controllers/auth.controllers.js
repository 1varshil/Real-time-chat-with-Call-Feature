import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import genToken from "../config/token.js";
import { sendEmail } from "../services/mail.js";
import fs from "fs";
import path from "path";
import { io } from "../socket/socket.js";

export const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const checkUserByUserName = await User.findOne({ username });
        const checkUserByEmail = await User.findOne({ email });

        
        if (checkUserByUserName) {
            return res.status(400).json({ message: "Username already exists" })
        }
        if (checkUserByEmail) {
            return res.status(400).json({ message: "Email already exists" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const NewUser = await User.create({
            username,
            password: hashedPassword,
            email
        })

        const token = await genToken(NewUser._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days,
            sameSite: "Strict",
            secure: false
        });

        // const filePath = path.join(process.cwd(), "templates/email_template.html");

        // let html = fs.readFileSync(filePath, "utf8");

        // // replace placeholder
        // html = html.replace("{{password}}", password);

        //     await sendEmail({
        //         to: NewUser.email,
        //         from: process.env.EMAIL,
        //         subject: "Your ABC Company Registration is Successful",
        //         text: "<h1><b>Welcome to ABC Company</b></h1><p>Thank you for registering with us.your password is basically like {password}</p>",
        //         html : html
        //     });

        const newUserObj = NewUser.toObject();
        delete newUserObj.password;
        io.emit("newUser", newUserObj);

        return res.status(201).json(NewUser);

    } catch (error) {
        return res.status(500).json({ message: `signup Error : ${error.message}` });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid email Address or password" })
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days,
            sameSite: "Strict",
            secure: false
        })

        return res.status(200).json({
            user
        });

    }
    catch (err) {
        return res.status(500).json({ message: `Login Error : ${err.message}` });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: `Logout Error : ${error.message}` });
    }
}
