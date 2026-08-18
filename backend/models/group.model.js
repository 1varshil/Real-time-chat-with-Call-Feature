import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  groupName:{
    type: String,
    required: true
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  groupImage: String,

  isGroup: {
    type: Boolean,
    default: true
}

},{timestamps: true});

const Group = mongoose.model("Group", groupSchema);
export default Group;