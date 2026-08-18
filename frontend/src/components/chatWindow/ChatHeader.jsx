import React from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlinePhone,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import Avatar from "../Avatar";
import DefaultImg from "../../assets/default-user.png";
import { useWebRTC } from "../../custom-hooks/useWebRTC.jsx";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ChatHeader = ({ activeChat, isGroup, onBack, isChatUserOnline }) => {
  const { callUser } = useWebRTC();

  const memberNames = activeChat?.members
    ?.map((member) => member?.username)
    .join(", ");

  const handleCall = () => {
    if (!isGroup) {
      callUser(activeChat._id || activeChat.id, true); 
    } else {
      alert("Group calling is not supported yet.");
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md"
    >
      <div className="flex items-center gap-5">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400"
        >
          <HiOutlineArrowLeft className="text-xl" />
        </button>
        <div className="relative flex items-center gap-4">
          {isGroup ? (
            <div className="flex flex-col">
              <h2 className="font-bold text-white text-lg tracking-tight">
                {activeChat.name || activeChat.groupName}
              </h2>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {memberNames}
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Avatar
                  src={activeChat.image || DefaultImg}
                  initials={getInitials(activeChat.name || activeChat.username)}
                  isOnline={isChatUserOnline}
                  size="h-12 w-12"
                />
                {isChatUserOnline && (
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
                )}
              </div>

              <div className="flex flex-col">
                <h2 className="font-bold text-white text-lg tracking-tight">
                  {activeChat.name || activeChat.username}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isChatUserOnline
                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        : "bg-gray-600"
                    }`}
                  ></span>
                  <p
                    className={`text-xs font-bold ${
                      isChatUserOnline ? "text-green-500/80" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    {isChatUserOnline ? "Online Now" : "Currently Offline"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCall}
          title="Start a call"
          className="p-2.5 hover:bg-indigo-500/20 rounded-xl transition-all text-gray-400 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 active:scale-95"
        >
          <HiOutlinePhone className="text-xl" />
        </button>
        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 border border-white/5">
          <HiOutlineDotsVertical className="text-xl" />
        </button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
