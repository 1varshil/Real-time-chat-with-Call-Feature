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
      className="px-3 sm:px-6 md:px-8 py-3 md:py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md gap-2"
    >
      <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 min-w-0 flex-1">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden p-2 -ml-1 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white shrink-0 active:scale-95"
        >
          <HiOutlineArrowLeft className="text-xl sm:text-2xl" />
        </button>
        <div className="relative flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
          {isGroup ? (
            <div className="flex flex-col min-w-0">
              <h2 className="font-bold text-white text-base sm:text-lg tracking-tight truncate">
                {activeChat.name || activeChat.groupName}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate max-w-[170px] sm:max-w-[280px] md:max-w-[400px]">
                {memberNames || `${activeChat?.members?.length || 0} members`}
              </p>
            </div>
          ) : (
            <>
              <div className="relative shrink-0">
                <Avatar
                  src={activeChat.image || DefaultImg}
                  initials={getInitials(activeChat.name || activeChat.username)}
                  isOnline={isChatUserOnline}
                  size="h-10 w-10 sm:h-12 sm:w-12"
                />
                {isChatUserOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-white text-base sm:text-lg tracking-tight truncate max-w-[140px] sm:max-w-[240px] md:max-w-none">
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
                    className={`text-[10px] sm:text-xs font-bold ${
                      isChatUserOnline ? "text-green-500/80" : "text-gray-500"
                    } uppercase tracking-wider truncate`}
                  >
                    {isChatUserOnline ? "Online Now" : "Offline"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={handleCall}
          title="Start a call"
          className="p-2 sm:p-2.5 hover:bg-indigo-500/20 rounded-xl transition-all text-gray-300 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 active:scale-95"
        >
          <HiOutlinePhone className="text-lg sm:text-xl" />
        </button>
        <button 
          title="More options"
          className="p-2 sm:p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-300 border border-white/5 active:scale-95"
        >
          <HiOutlineDotsVertical className="text-lg sm:text-xl" />
        </button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
