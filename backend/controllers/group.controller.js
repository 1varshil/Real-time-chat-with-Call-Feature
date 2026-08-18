import Group from "../models/group.model.js";
import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";

export const createGroup = async (req, res) => {
    try {
        const { groupName, members } = req.body;

        if (!groupName || !members || !Array.isArray(members)) {
            return res.status(400).json({ message: "Group name and members are required" });
        }

        const memberIds = [req.userId, ...members];

        const group = await Group.create({
            groupName,
            admin: req.userId,
            members: memberIds
        });

        await Conversation.create({
            isGroup: true,
            groupId: group._id,
            participants: memberIds,
            readStatus: memberIds.map((userId) => ({
                user: userId,
                lastReadAt: null,
                lastReadMessageId: null
            }))
        });

        res.status(201).json({
            message: "Group created successfully",
            group: {
                ...group.toObject(),
                unreadCount: 0,
                lastMessage: null,
                lastMessageAt: null
            }
        });
    } catch (error) {
        res.status(500).json({ message: `Create Group Error: ${error.message}` });
    }
};

export const allGroups = async (req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.userId);

        const groups = await Group.aggregate([
            {
                $match: {
                    members: currentUserId
                }
            },
            {
                $lookup: {
                    from: "conversations",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "conversation"
                }
            },
            {
                $unwind: {
                    path: "$conversation",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "conversation.lastMessage",
                    foreignField: "_id",
                    as: "lastMessageDetails"
                }
            },
            {
                $unwind: {
                    path: "$lastMessageDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    myReadStatus: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: { $ifNull: ["$conversation.readStatus", []] },
                                    as: "rs",
                                    cond: { $eq: ["$$rs.user", currentUserId] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "messages",
                    let: {
                        groupId: "$_id",
                        lastReadAt: "$myReadStatus.lastReadAt"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$groupId", "$$groupId"] },
                                        { $ne: ["$sender", currentUserId] },
                                        {
                                            $or: [
                                                { $eq: [{ $ifNull: ["$$lastReadAt", null] }, null] },
                                                { $gt: ["$createdAt", "$$lastReadAt"] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "unreadMessages"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "members",
                    foreignField: "_id",
                    as: "memberDetails"
                }
            },
            {
                $addFields: {
                    lastMessage: "$lastMessageDetails.message",
                    lastMessageAt: "$conversation.lastMessageAt",
                    unreadCount: {
                        $ifNull: [{ $arrayElemAt: ["$unreadMessages.count", 0] }, 0]
                    },
                    members: {
                        $map: {
                            input: "$memberDetails",
                            as: "m",
                            in: {
                                _id: "$$m._id",
                                username: "$$m.username",
                                name: "$$m.name",
                                image: "$$m.image"
                            }
                        }
                    }
                }
            },
            {
                $sort: {
                    lastMessageAt: -1,
                    createdAt: -1
                }
            },
            {
                $project: {
                    conversation: 0,
                    lastMessageDetails: 0,
                    myReadStatus: 0,
                    unreadMessages: 0,
                    memberDetails: 0
                }
            }
        ]);

        const formatted = groups.map((group) => {
            if (group.lastMessageAt) {
                group.time = new Date(group.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
            }
            return group;
        });

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: `All Groups Error: ${error.message}` });
    }
};
