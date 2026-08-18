import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineSearch } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import Avatar from "./Avatar";
import CreateGroupModal from "./CreateGroupModal.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import DefaultImg from "../assets/default-user.png";
import { useSocket } from "../contexts/socketContext";
import { Virtuoso } from "react-virtuoso";
import { setLoadingMore, appendOtherUsers } from "../redux/userSlice";
import axios from "axios";
import { Serverurl } from "../main";
import { appendGroups } from "../redux/groupSlice.js";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ChatSidebar = ({ conversations, activeChat, onChatSelect, groups }) => {
  const [activeTab, setActiveTab] = useState("Personal");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { userData, pagination } = useSelector((state) => state.user);
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isUserOnline = (userId) => onlineUsers.includes(userId);
  const activeNowUsers =
    conversations?.filter((user) => isUserOnline(user._id)) || [];

  const handleGroupCreated = (newGroup) => {
    dispatch(appendGroups(newGroup));
  };

  const loadMore = async () => {
    if (!pagination.hasMore || pagination.loading) return;
    try {
      dispatch(setLoadingMore(true));
      const nextPage = pagination.page + 1;
      const response = await axios.get(`${Serverurl}/api/user/other-users`, {
        params: { page: nextPage, limit: 20 },
        withCredentials: true,
      });
      dispatch(appendOtherUsers(response.data));
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      dispatch(setLoadingMore(false));
    }
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${activeChat ? "hidden md:flex" : "flex"} w-full md:w-[320px] lg:w-[380px] flex-col h-full bg-black/20 backdrop-blur-xl border-r border-white/10 z-20`}
    >
      <div
        className="flex justify-between items-center p-6 cursor-pointer hover:bg-white/5 transition-colors group"
        onClick={() => navigate("/profile")}
      >
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">
            My Profile
          </span>
          <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {userData?.name || userData?.username}
          </h2>
        </div>
        <div className="relative">
          <Avatar
            src={userData?.image}
            initials={getInitials(userData?.name || userData?.username)}
            isOnline={true}
            size="h-12 w-12"
          />
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
        </div>
      </div>

      {/* Search Header */}
      <div className="px-6 pb-4 flex items-center gap-2 w-full">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 text-sm"
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <button
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20 active:scale-95"
        >
          <FaPlus className="text-sm" />
        </button>
      </div>

      {/* Online Users Horizontal Bar */}
      <div className="px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Active Now
          </p>
          <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse"></span>
        </div>
        <div className="flex gap-4 overflow-x-auto py-1 no-scrollbar">
          {activeNowUsers.length > 0 ? (
            activeNowUsers.map((user, idx) => (
              <motion.div
                key={user._id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onChatSelect({ ...user, isGroup: false })}
                className="flex flex-col items-center cursor-pointer min-w-[56px] gap-2 group"
              >
                <div className="relative">
                  <Avatar
                    src={user.image || DefaultImg}
                    initials={getInitials(user.name || user.username)}
                    isOnline={true}
                    size="h-14 w-14"
                  />
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold truncate w-14 text-center group-hover:text-white transition-colors">
                  {(user.name || user.username)?.split(" ")[0]}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="py-2 text-gray-500 text-xs italic opacity-50">
              None currently active
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-4 mt-2">
        {["Personal", "Groups"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase relative transition-all ${
              activeTab === tab
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabLine"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Conversations List For Chat */}
      <div className="flex-1 overflow-hidden mt-2">
        <Virtuoso
          style={{ height: "100%" }}
          data={activeTab === "Personal" ? conversations : groups}
          endReached={loadMore}
          itemContent={(index, chat) => {
            const isGroup = activeTab === "Groups";
            const displayName = isGroup
              ? chat.groupName || chat.username
              : chat.name || chat.username;

            return (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: (index % 10) * 0.03 }}
                key={chat._id}
                onClick={() =>
                  onChatSelect({ ...chat, isGroup: !!isGroup })
                }
                className={`px-6 py-4 flex items-center gap-4 transition-all hover:bg-white/5 cursor-pointer relative group ${
                  activeChat?._id === chat._id
                    ? "bg-indigo-500/10 border-l-4 border-indigo-500"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={chat.image}
                    initials={getInitials(displayName)}
                    isOnline={!isGroup && isUserOnline(chat._id)}
                    size="h-12 w-12"
                  />
                  {!isGroup && isUserOnline(chat._id) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-white truncate text-[15px] group-hover:text-indigo-300 transition-colors">
                      {displayName}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {chat.time ||
                        (chat.lastMessageAt
                          ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-md text-gray-400 truncate font-semibold max-w-[180px]">
                      {isGroup
                        ? chat.lastMessage ||
                          `${chat.members?.length || 0} Members`
                        : chat.lastMessage || "No messages yet"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="min-w-5 h-5 px-1.5 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          }}
          components={{
            Footer: () =>
              activeTab === "Personal" && pagination.loading ? (
                <div className="p-4 flex justify-center">
                  <div className="h-5 w-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              ) : null,
          }}
        />
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </motion.div>
  );
};

export default ChatSidebar;
