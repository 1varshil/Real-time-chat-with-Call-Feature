import { useState, useEffect, useRef } from "react";

export const useTyping = (socket, activeChat, authUser, isGroup) => {
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const isTypingLocallyRef = useRef(false);

  useEffect(() => {
    setTypingUser(null);
    if (!socket || !activeChat) return;

    const handleTyping = (data) => {
      console.log("Received typing event:", data);
      if (isGroup) {
        if (
          data.groupId === (activeChat?._id || activeChat?.id) &&
          data.userId !== (authUser?._id || authUser?.id)
        ) {
          console.log("Setting typing user for group");
          setTypingUser({ userId: data.userId, username: data.username });
        }
      } else {
        if (data.userId === (activeChat?._id || activeChat?.id)) {
          console.log("Setting typing user for personal chat");
          setTypingUser({ userId: data.userId, username: data.username });
        }
      }
    };

    const handleStopTyping = (data) => {
      console.log("Received stopTyping event:", data);
      if (isGroup) {
        if (data.groupId === (activeChat?._id || activeChat?.id)) {
          setTypingUser(null);
        }
      } else {
        if (data.userId === (activeChat?._id || activeChat?.id)) {
          setTypingUser(null);
        }
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, activeChat, isGroup, authUser]);

  const emitTyping = () => {
    if (!socket || !activeChat || !authUser) return;

    const payload = isGroup
      ? {
          groupId: activeChat._id || activeChat.id,
          userId: authUser._id || authUser.id,
          username: authUser.username,
        }
      : {
          receiverId: activeChat._id || activeChat.id,
          userId: authUser._id || authUser.id,
          username: authUser.username,
        };

    console.log("Emitting typing:", payload);

    if (!isTypingLocallyRef.current) {
      socket.emit("typing", payload);
      isTypingLocallyRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", payload);
      isTypingLocallyRef.current = false;
    }, 2000);
  };

  return { typingUser, emitTyping };
};
