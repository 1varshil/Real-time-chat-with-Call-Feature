import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlinePaperClip, HiX } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { chatService } from "../../services/chat.service";

const ChatInput = ({ activeChat, addMessage, emitTyping }) => {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (emitTyping) {
        emitTyping();
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !imageFile) || isSending) return;
    
    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("message", message);
      if (imageFile) formData.append("image", imageFile);
      
      const receiverId = activeChat._id || activeChat.id;
      const isGroup = activeChat?.isGroup === true;
      const sentMessage = await chatService.sendMessage(receiverId, formData, isGroup);
      
      addMessage(sentMessage);
      setMessage("");
      clearImage();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 bg-white/[0.02] backdrop-blur-lg border-t border-white/5">
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pb-4"
          >
            <div className="relative inline-block group">
              <img
                src={imagePreview}
                alt="preview"
                className="h-24 w-auto rounded-xl border-2 border-indigo-500/50 object-cover shadow-2xl"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
              >
                <HiX className="text-sm font-bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={sendMessage} className="relative">
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[24px] p-2 pl-4 focus-within:border-indigo-500/50 transition-all shadow-inner">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-2xl text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95"
          >
            😊
          </button>

          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-[130%] left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10"
            >
              <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
            </motion.div>
          )}

          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-[16px] font-medium py-2"
            disabled={isSending}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-indigo-400 transition-all hover:bg-white/5 rounded-full"
            disabled={isSending}
          >
            <HiOutlinePaperClip className="text-2xl" />
          </button>

          <button
            type="submit"
            disabled={isSending || (!message.trim() && !imageFile)}
            className="flex items-center justify-center h-12 w-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-[0_4px_15px_rgba(79,70,229,0.4)] active:scale-90"
          >
            {isSending ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <IoSend className="text-xl translate-x-0.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
