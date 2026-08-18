import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { Serverurl } from "../main";
import { addNewUser } from "../redux/userSlice";

const SocketContext = createContext();

// Custom hook — any component can call useSocket() to get socket + onlineUsers
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Only connect when we have a logged-in user
    if (userData?._id) {
      const socketInstance = io(Serverurl, {
        query: {
          userId: userData._id,
        },
      });

      // Listen for online users list from backend
      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Listen for newly registered users
      socketInstance.on("newUser", (newUser) => {
        if (newUser._id !== userData._id) {
          dispatch(addNewUser(newUser));
        }
      });

      setSocket(socketInstance);

      // Cleanup: close socket when user logs out or component unmounts
      return () => {
        socketInstance.close();
        setSocket(null);
        setOnlineUsers([]);
      };
    } else {
      // User logged out — clean up any existing socket
      if (socket) {
        socket.close();
        setSocket(null);
        setOnlineUsers([]);
      }
    }
  }, [userData?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
