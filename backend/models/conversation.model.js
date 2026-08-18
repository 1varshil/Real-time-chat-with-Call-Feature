import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        default: null
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastMessageAt: Date,
    readStatus: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        lastReadAt: {
            type: Date,
            default: null
        },
        lastReadMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        }
    }]
}, {
    timestamps: true
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
