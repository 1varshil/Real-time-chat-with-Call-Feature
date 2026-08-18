import React from "react";
import { motion } from "framer-motion";

const TypingIndicator = ({ username }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="flex justify-start"
    >
      <div className="flex flex-col gap-1">
        {username && (
          <span className="text-xs text-gray-400 ml-2">{username}</span>
        )}

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-bl-none shadow-black/20 flex items-center gap-1 w-[70px]">
          <motion.span
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
