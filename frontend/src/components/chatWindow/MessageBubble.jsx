import React from "react";
import { motion } from "framer-motion";
import { BsCheck, BsCheckAll } from "react-icons/bs";

const getId = (value) => {
  if (!value) return null;
  return typeof value === "object" ? value._id : value;
};

const MessageBubble = ({ msg, isMine, isGroup, memberCount = 0 }) => {
  const readBy = msg.readBy || [];
  const isReadPersonal = !isGroup && readBy.length > 0;
  const seenCount = isGroup
    ? readBy.filter((entry) => getId(entry.user)).length
    : 0;
  const othersCount = Math.max((memberCount || 0) - 1, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative p-4 rounded-2xl max-w-[70%] group shadow-xl ${
          isMine
            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-500/10"
            : "bg-white/5 backdrop-blur-md text-gray-100 border border-white/10 rounded-bl-none shadow-black/20"
        }`}
      >
        {msg.image && (
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={msg.image}
            alt="attachment"
            className="max-w-full h-auto rounded-xl mb-3 border border-white/10"
          />
        )}
        {msg.message && (
          <p className="text-[15px] leading-relaxed font-medium">
            {msg.message}
          </p>
        )}
        <div
          className={`mt-2 flex items-center gap-1.5 ${
            isMine ? "justify-end" : "justify-end"
          }`}
        >
          <span
            className={`text-[9px] font-bold uppercase tracking-widest ${
              isMine ? "text-white/60" : "text-gray-500"
            }`}
          >
            {msg.time ||
              (msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "")}
          </span>
          {isMine && !isGroup && (
            <span className="text-sm leading-none">
              {isReadPersonal ? (
                <BsCheckAll className="text-sky-300" title="Read" />
              ) : (
                <BsCheck className="text-white/50" title="Sent" />
              )}
            </span>
          )}
        </div>
        {isMine && isGroup && othersCount > 0 && (
          <p className="text-[10px] mt-1 text-white/50 text-right font-medium">
            Seen by {seenCount}/{othersCount}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
