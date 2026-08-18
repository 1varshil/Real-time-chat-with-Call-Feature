import React from "react";
import { motion } from "framer-motion";
import { IoSend } from "react-icons/io5";

function Norecords() {
  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex h-full hidden md:flex flex-col items-center justify-center bg-[#0f172a] text-gray-500 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 flex flex-col items-center"
        >
          <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
            <IoSend className="text-4xl text-indigo-500/50 -rotate-45" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Space Awaits
          </h2>
          <p className="text-gray-400 font-medium">
            Select a friend to start a conversation
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Norecords;
