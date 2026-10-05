import React, { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const getId = (value) => {
  if (!value) return null;
  return typeof value === "object" ? value._id : value;
};

const MessageList = ({
  messageList,
  authUser,
  typingUser,
  isGroup,
  memberCount,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, typingUser]);

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar relative z-10">
      <AnimatePresence>
        {messageList.map((msg, idx) => {
          const isMine = getId(msg.sender) === authUser?._id;
          return (
            <MessageBubble
              key={msg._id || idx}
              msg={msg}
              isMine={isMine}
              isGroup={isGroup}
              memberCount={memberCount}
            />
          );
        })}
        {typingUser?.username && (
          <TypingIndicator username={typingUser.username} />
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
