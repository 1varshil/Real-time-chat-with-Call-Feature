import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getCurrentUser = async (req, res) => {
    try {
        let userId = req.userId;
        if (!userId || userId === "undefined") {
            return res.status(401).json({ message: "Unauthorized hai bhai " });
        }

        let user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {}
};

export const editProfile = async (req, res) => {
    try {
        const { name } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;

        let user = await User.findByIdAndUpdate(req.userId, updateData, {
            returnDocument: "after"
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in edit profile :", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getOtherUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const currentUserId = new mongoose.Types.ObjectId(req.userId);

        const totalUsers = await User.countDocuments({ _id: { $ne: currentUserId } });

        const users = await User.aggregate([
            { $match: { _id: { $ne: currentUserId } } },
            {
                $lookup: {
                    from: "conversations",
                    let: { otherUserId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$isGroup", false] },
                                        { $in: [currentUserId, "$participants"] },
                                        { $in: ["$$otherUserId", "$participants"] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "messages",
                                localField: "lastMessage",
                                foreignField: "_id",
                                as: "lastMessageDetails"
                            }
                        },
                        {
                            $sort: {
                                lastMessageAt: -1
                            }
                        },
                        {
                            $unwind: {
                                path: "$lastMessageDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
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
                        otherUserId: "$_id",
                        lastReadAt: "$myReadStatus.lastReadAt"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$sender", "$$otherUserId"] },
                                        { $eq: ["$receiver", currentUserId] },
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
                $addFields: {
                    lastMessage: "$conversation.lastMessageDetails.message",
                    lastMessageAt: "$conversation.lastMessageAt",
                    unreadCount: {
                        $ifNull: [{ $arrayElemAt: ["$unreadMessages.count", 0] }, 0]
                    }
                }
            },
            {
                $sort: {
                    lastMessageAt: -1
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    password: 0,
                    conversation: 0,
                    myReadStatus: 0,
                    unreadMessages: 0
                }
            }
        ]);

        const formattedUsers = users.map((user) => {
            if (user.lastMessageAt) {
                user.time = new Date(user.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
            }
            return user;
        });

        return res.status(200).json({
            users: formattedUsers,
            total: totalUsers,
            hasMore: skip + users.length < totalUsers
        });
    } catch (error) {
        console.log("Error in get other users :", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
