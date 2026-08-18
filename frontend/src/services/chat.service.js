import axios from "axios";
import { Serverurl } from "../main";

export const chatService = {
  getMessages: async (receiverId, isGroup = false) => {
    try {
      const response = await axios.get(
        `${Serverurl}/api/message/get/${receiverId}?isGroup=${isGroup}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error while fetching messages", err);
      throw err;
    }
  },
  
  sendMessage: async (receiverId, formData, isGroup = false) => {
    try {
      const response = await axios.post(
        `${Serverurl}/api/message/send/${receiverId}?isGroup=${isGroup}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
};
