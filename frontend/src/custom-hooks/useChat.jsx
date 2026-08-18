import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatService } from "../services/chat.service";
import { clearUnreadCount } from "../redux/userSlice";
import { clearGroupUnreadCount } from "../redux/groupSlice";

const getId = (value) => {
  if (!value) return null;
  return typeof value === "object" ? value._id : value;
};

export const useChat = (activeChat, socket, isGroup) => {
  const [messageList, setMessageList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.user.userData);
  const activeChatIdRef = useRef(null);

  const activeChatId = activeChat?._id || activeChat?.id;
  activeChatIdRef.current = activeChatId;

  const clearBadge = (chatId) => {
    if (!chatId) return;
    if (isGroup) {
      dispatch(clearGroupUnreadCount(chatId));
    } else {
      dispatch(clearUnreadCount(chatId));
    }
  };

  const emitMarkAsRead = (messages = []) => {
    if (!socket || !activeChatId) return;
    const lastMessage = messages[messages.length - 1];
    socket.emit("markAsRead", {
      chatId: activeChatId,
      isGroup: !!isGroup,
      lastMessageId: lastMessage?._id || null,
    });
    clearBadge(activeChatId);
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    setIsLoading(true);
    setMessageList([]);
    try {
      const receiverId = activeChat._id || activeChat.id;
      const data = await chatService.getMessages(receiverId, isGroup);
      setMessageList(data);
      emitMarkAsRead(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeChat]);

  useEffect(() => {
    if (!socket || !activeChat) return;

    const handleNewMessage = (newMessage) => {
      const currentActiveId = activeChatIdRef.current;
      const senderId = getId(newMessage.sender);
      const receiverId = getId(newMessage.receiver);
      const groupId = getId(newMessage.groupId);

      const isForActiveChat = isGroup
        ? groupId === currentActiveId || receiverId === currentActiveId
        : senderId === currentActiveId;

      if (!isForActiveChat) return;

      setMessageList((prev) => [...prev, newMessage]);
      socket.emit("markAsRead", {
        chatId: currentActiveId,
        isGroup: !!isGroup,
        lastMessageId: newMessage._id,
      });
      clearBadge(currentActiveId);
    };

    const handleMessagesRead = (payload) => {
      if (!payload) return;

      if (payload.self) {
        if (payload.chatId === activeChatIdRef.current) {
          clearBadge(payload.chatId);
        }
        return;
      }

      const readByUserId = payload.readByUserId;
      const messageIds = (payload.messageIds || []).map(String);
      const readAt = payload.lastReadAt || new Date().toISOString();

      if (payload.isGroup) {
        if (payload.chatId !== activeChatIdRef.current) return;
      } else {
        // Peer marked the DM with us as read: their chatId is our userId
        if (payload.chatId !== authUser?._id) return;
        if (readByUserId !== activeChatIdRef.current) return;
      }

      // Nothing newly marked — no tick updates needed
      if (messageIds.length === 0) return;

      setMessageList((prev) =>
        prev.map((msg) => {
          const msgId = String(msg._id);
          const isOwn = getId(msg.sender) === authUser?._id;
          if (!isOwn) return msg;
          if (!messageIds.includes(msgId)) return msg;

          const alreadyRead = (msg.readBy || []).some(
            (entry) => getId(entry.user) === readByUserId,
          );
          if (alreadyRead) return msg;

          return {
            ...msg,
            readBy: [...(msg.readBy || []), { user: readByUserId, readAt }],
          };
        }),
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [activeChat, socket, isGroup, authUser?._id, dispatch]);

  const addMessage = (message) => {
    setMessageList((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (!socket || !activeChat || !isGroup) return;

    const groupId = activeChat._id || activeChat.id;

    socket.emit("joinGroup", {
      groupId,
    });

    return () => {
      socket.emit("leaveGroup", {
        groupId,
      });
    };
  }, [socket, activeChat, isGroup]);

  return { messageList, isLoading, addMessage };
};
