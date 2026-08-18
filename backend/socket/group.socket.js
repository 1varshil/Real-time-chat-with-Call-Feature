export const registerGroupHandlers = (io, socket, userSocketMap) => {
    socket.on("joinGroup", async ({ groupId, userId }) => {
        socket.join(groupId);
        socket.to(groupId).emit("userJoinedGroup", { groupId, userId });
    });

    socket.on("leaveGroup", async ({ groupId }) => {
        socket.leave(groupId);
    });

    socket.on("sendMessage", (data) => {
        socket.to(data.groupId).emit("receiveMessage", data);
        socket.emit("messageSent", true);
    });
};
