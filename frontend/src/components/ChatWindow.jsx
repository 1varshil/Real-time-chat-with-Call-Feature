import { useSelector } from "react-redux";

import ChatHeader from "./chatWindow/ChatHeader";
import MessageList from "./chatWindow/MessageList";
import ChatInput from "./chatWindow/ChatInput";

import { useChat } from "../custom-hooks/useChat";
import { useTyping } from "../custom-hooks/useTyping";
import { useSocket } from "../contexts/socketContext";
import Norecords from "./Norecords";

const ChatWindow = ({ activeChat, onBack }) => {
  const { socket, onlineUsers } = useSocket();
  const authUser = useSelector((state) => state.user.userData);

  const isGroup = activeChat?.isGroup === true;

  const isChatUserOnline = onlineUsers.includes(
    activeChat?._id || activeChat?.id,
  );

  const { messageList, isLoading, addMessage } = useChat(
    activeChat,
    socket,
    isGroup,
  );
  const { typingUser, emitTyping } = useTyping(
    socket,
    activeChat,
    authUser,
    isGroup,
  );

  if (!activeChat) {
    return (
      <div className="w-[76%] h-full flex items-center justify-center">
        <Norecords />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] relative z-10 overflow-hidden">
      {/* Beautiful Chat Wallpaper */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] bg-repeat pointer-events-none mix-blend-screen"
        style={{ 
          backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundSize: "400px" 
        }}
      ></div>

      <div className="relative z-10 flex-1 flex flex-col h-full">
        <ChatHeader
          activeChat={activeChat}
          isGroup={isGroup}
          onBack={onBack}
          isChatUserOnline={isChatUserOnline}
        />

        <MessageList
          messageList={messageList}
          authUser={authUser}
          typingUser={typingUser}
          isGroup={isGroup}
          memberCount={activeChat?.members?.length || 0}
        />

        <ChatInput
          activeChat={activeChat}
          addMessage={addMessage}
          emitTyping={emitTyping}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
