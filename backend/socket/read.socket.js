import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import mongoose from "mongoose";

const upsertReadStatus = (conversation, userId, lastReadAt, lastReadMessageId) => {
    const existing = conversation.readStatus?.find(
        (entry) => entry.user.toString() === userId.toString()
    );

    if (existing) {
        existing.lastReadAt = lastReadAt;
        existing.lastReadMessageId = lastReadMessageId || existing.lastReadMessageId;
    } else {
        conversation.readStatus = conversation.readStatus || [];
        conversation.readStatus.push({
            user: userId,
            lastReadAt,
            lastReadMessageId: lastReadMessageId || null
        });
    }
};

export const registerReadHandlers = (io, socket, userSocketMap) => {
    socket.on("markAsRead", async (data) => {
        try {
            const userId = socket.handshake.query.userId;
            if (!userId || !data?.chatId) return;

            const { chatId, isGroup, lastMessageId } = data;
            const lastReadAt = new Date();
            let conversation;

            if (isGroup) {
                conversation = await Conversation.findOne({
                    groupId: chatId,
                    isGroup: true
                });

                if (!conversation) {
                    const group = await Group.findById(chatId);
                    if (!group) return;

                    conversation = await Conversation.create({
                        isGroup: true,
                        groupId: chatId,
                        participants: group.members,
                        readStatus: group.members.map((memberId) => ({
                            user: memberId,
                            lastReadAt: memberId.toString() === userId.toString() ? lastReadAt : null,
                            lastReadMessageId:
                                memberId.toString() === userId.toString()
                                    ? lastMessageId || null
                                    : null
                        }))
                    });
                } else {
                    upsertReadStatus(conversation, userId, lastReadAt, lastMessageId);
                    await conversation.save();
                }
            } else {
                conversation = await Conversation.findOne({
                    participants: { $all: [userId, chatId] },
                    isGroup: false
                });

                if (!conversation) {
                    conversation = await Conversation.create({
                        participants: [userId, chatId],
                        isGroup: false,
                        readStatus: [
                            {
                                user: userId,
                                lastReadAt,
                                lastReadMessageId: lastMessageId || null
                            },
                            {
                                user: chatId,
                                lastReadAt: null,
                                lastReadMessageId: null
                            }
                        ]
                    });
                } else {
                    upsertReadStatus(conversation, userId, lastReadAt, lastMessageId);
                    await conversation.save();
                }
            }

            const readerObjectId = new mongoose.Types.ObjectId(userId);
            const messageFilter = isGroup
                ? {
                      groupId: chatId,
                      sender: { $ne: userId },
                      readBy: { $not: { $elemMatch: { user: readerObjectId } } },
                      createdAt: { $lte: lastReadAt }
                  }
                : {
                      sender: chatId,
                      receiver: userId,
                      readBy: { $not: { $elemMatch: { user: readerObjectId } } },
                      createdAt: { $lte: lastReadAt }
                  };

            const unreadMessages = await Message.find(messageFilter).select("_id");
            const messageIds = unreadMessages.map((msg) => msg._id);

            if (messageIds.length > 0) {
                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    {
                        $push: {
                            readBy: {
                                user: new mongoose.Types.ObjectId(userId),
                                readAt: lastReadAt
                            }
                        }
                    }
                );
            }

            const payload = {
                chatId,
                isGroup: !!isGroup,
                readByUserId: userId,
                lastReadAt,
                messageIds
            };

            if (isGroup) {
                const group = await Group.findById(chatId);
                if (group) {
                    group.members.forEach((memberId) => {
                        const memberStr = memberId.toString();
                        if (memberStr === userId.toString()) return;
                        const memberSocketId = userSocketMap[memberStr];
                        if (memberSocketId) {
                            io.to(memberSocketId).emit("messagesRead", payload);
                        }
                    });
                }
                // Confirm to the reader so they can clear their own badge
                socket.emit("messagesRead", { ...payload, self: true });
            } else {
                const otherSocketId = userSocketMap[chatId];
                if (otherSocketId) {
                    io.to(otherSocketId).emit("messagesRead", payload);
                }
                socket.emit("messagesRead", { ...payload, self: true });
            }
        } catch (error) {
            console.log("Error in markAsRead:", error.message);
        }
    });
};
