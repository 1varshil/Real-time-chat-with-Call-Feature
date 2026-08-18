export const registerMessageHandlers = (io, socket, userSocketMap) => {
    socket.on("typing", (data) => {
        if (data.receiverId) {
            const receiverSocketId = userSocketMap[data.receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", data);
            }
        } else if (data.groupId) {
            socket.to(data.groupId).emit("typing", data);
        }
    });

    socket.on("stopTyping", (data) => {
        if (data.receiverId) {
            const receiverSocketId = userSocketMap[data.receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stopTyping", data);
            }
        } else if (data.groupId) {
            socket.to(data.groupId).emit("stopTyping", data);
        }
    });
};
