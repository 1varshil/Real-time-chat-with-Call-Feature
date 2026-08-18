import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark, FaPlus, FaCheck } from "react-icons/fa6";
import { useSelector } from "react-redux";
import axios from "axios";
import { Serverurl } from "../main";
import Avatar from "./Avatar";
import DefaultImg from "../assets/default-user.png";
import { SocketProvider } from "../contexts/socketContext";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { otherUsers } = useSelector((state) => state.user);

  const filteredUsers = otherUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );

    console.log("Selected Memebers looks like : ", selectedMembers);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert("Please enter a group name");
    if (selectedMembers.length === 0)
      return alert("Please select at least one member");

    setLoading(true);
    try {
      const response = await axios.post(
        `${Serverurl}/api/group/create-group`,
        {
          groupName,
          members: selectedMembers,
        },
        { withCredentials: true },
      );

      if (response.data.group) {
        console.log(
          "basically group is being created and like response is looks like :",
          response.data,
        );
        onGroupCreated(response.data.group);
        onClose();
        setGroupName("");
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">Create New Group</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <FaXmark size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Group Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                />
              </div>

              {/* Members Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Select Members
                  </label>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                    {selectedMembers.length} Selected
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500/30 text-sm text-white placeholder-gray-500 mb-2"
                />

                <div className="max-h-60 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => toggleMember(user._id)}
                      className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all ${
                        selectedMembers.includes(user._id)
                          ? "bg-indigo-500/10 border border-indigo-500/20"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Avatar
                        src={user.image || DefaultImg}
                        initials={getInitials(user.name || user.username)}
                        size="h-10 w-10"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {user.name || user.username}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                          selectedMembers.includes(user._id)
                            ? "bg-indigo-500 border-indigo-500 text-white"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        <FaCheck size={10} />
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm italic">
                      No users found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={
                  loading || !groupName.trim() || selectedMembers.length === 0
                }
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all active:scale-95 text-sm flex items-center justify-center gap-2 ${
                  loading || !groupName.trim() || selectedMembers.length === 0
                    ? "bg-indigo-500/30 text-white/50 cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                }`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaPlus size={14} />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
