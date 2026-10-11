import React, { useState } from "react";
import { motion } from "framer-motion";
import ChatSidebar from "../components/ChatSidebar";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useSelector } from "react-redux";
import ChatWindow from "../components/ChatWindow";
import { useUnreadListener } from "../custom-hooks/useUnreadListener";

function Home() {
  const [activeChat, setActiveChat] = useState();
  const dispatch = useDispatch();
  const otherUsers = useSelector((state) => state.user.otherUsers);
  const GroupData = useSelector((state) => state.group.groups);

  useUnreadListener(activeChat);

  const handleLogout = async () => {
    try {
      dispatch(setUserData(null));
      navigate("/login");
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center p-0 md:p-6 lg:p-8 bg-[#0f172a] overflow-hidden relative">
      <div className="mesh-gradient opacity-40"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1600px] h-full md:h-[92vh] glass-card rounded-none md:rounded-[32px] flex overflow-hidden border-0 md:border md:border-white/10 relative z-10 shadow-2xl"
      >
        <ChatSidebar
          conversations={otherUsers}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          groups={GroupData}
        />
        <ChatWindow
          activeChat={activeChat}
          onBack={() => setActiveChat(null)}
        />

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          title="Logout"
          className={`absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white/60 hover:text-red-400 transition-colors z-30 bg-white/10 hover:bg-white/15 backdrop-blur-md p-2.5 md:p-3 rounded-2xl border border-white/10 shadow-xl ${
            activeChat ? "hidden md:block" : "block"
          }`}
          onClick={handleLogout}
        >
          <FiLogOut size={20} className="md:w-[22px] md:h-[22px]" />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Home;
