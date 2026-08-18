import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../contexts/socketContext";
import { incrementUnreadCount } from "../redux/userSlice";
import { incrementGroupUnreadCount } from "../redux/groupSlice";

const getId = (value) => {
  if (!value) return null;
  return typeof value === "object" ? value._id : value;
};

/**
 * Bumps sidebar unread counts for messages received while that chat is not open.
 */
export const useUnreadListener = (activeChat) => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.user.userData);

  useEffect(() => {
    if (!socket || !authUser?._id) return;

    const handleNewMessage = (newMessage) => {
      const senderId = getId(newMessage.sender);
      if (senderId === authUser._id) return;

      const groupId = getId(newMessage.groupId);
      const activeId = activeChat?._id || activeChat?.id;
      const activeIsGroup = activeChat?.isGroup === true;

      if (groupId) {
        if (activeIsGroup && activeId === groupId) return;
        dispatch(incrementGroupUnreadCount(groupId));
        return;
      }

      if (!activeIsGroup && activeId === senderId) return;
      dispatch(incrementUnreadCount(senderId));
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, activeChat, authUser?._id, dispatch]);
};
