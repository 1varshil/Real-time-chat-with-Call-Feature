import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import { io, userSocketMap } from "../socket/socket.js";

const buildReadStatus = (userIds) =>
    userIds.map((userId) => ({
        user: userId,
        lastReadAt: null,
        lastReadMessageId: null
    }));

export const sendMessage = async (req, res) => {
    try {
        let sender = req.userId;
        let { receiver } = req.params;
        let { message } = req.body;
        let isGroup = req.query.isGroup === "true";

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        let newMessageData = {
            sender,
            message,
            image: image?.url || "",
            readBy: []
        };

        if (isGroup) {
            newMessageData.groupId = receiver;
        } else {
            newMessageData.receiver = receiver;
        }

        let newMessage = await Message.create(newMessageData);

        let conversation;
        if (isGroup) {
            conversation = await Conversation.findOne({ groupId: receiver, isGroup: true });
            if (!conversation) {
                const group = await Group.findById(receiver);
                const memberIds = group?.members || [sender];
                conversation = await Conversation.create({
                    isGroup: true,
                    groupId: receiver,
                    participants: memberIds,
                    lastMessage: newMessage._id,
                    lastMessageAt: new Date(),
                    readStatus: buildReadStatus(memberIds)
                });
            } else {
                conversation.lastMessage = newMessage._id;
                conversation.lastMessageAt = new Date();
                await conversation.save();
            }
        } else {
            conversation = await Conversation.findOne({
                participants: { $all: [sender, receiver] },
                isGroup: false
            });
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [sender, receiver],
                    isGroup: false,
                    lastMessage: newMessage._id,
                    lastMessageAt: new Date(),
                    readStatus: buildReadStatus([sender, receiver])
                });
            } else {
                conversation.lastMessage = newMessage._id;
                conversation.lastMessageAt = new Date();
                await conversation.save();
            }
        }

        if (isGroup) {
            const group = await Group.findById(receiver);
            if (group) {
                group.members.forEach((memberId) => {
                    const memberStr = memberId.toString();
                    const memberSocketId = userSocketMap[memberStr];
                    if (memberSocketId && memberStr !== sender.toString()) {
                        io.to(memberSocketId).emit("newMessage", newMessage);
                    }
                });
            }
        } else {
            const receiverSocketId = userSocketMap[receiver];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }
        }

        return res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sending message", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const getAllMessages = async (req, res) => {
    try {
        let { receiver } = req.params;
        let sender = req.userId;
        let isGroup = req.query.isGroup === "true";

        let messages;
        if (isGroup) {
            messages = await Message.find({ groupId: receiver }).sort({ createdAt: 1 });
        } else {
            messages = await Message.find({
                $or: [
                    { sender: sender, receiver: receiver },
                    { sender: receiver, receiver: sender }
                ]
            }).sort({ createdAt: 1 });
        }

        return res.status(200).json(messages || []);
    } catch (error) {
        console.log("Error in getting messages", error.message);
        return res.status(500).json({ message: "Send Message Error : " + error.message });
    }
};
