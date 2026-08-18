export const registerCallHandlers = (io, socket, userSocketMap) => {
    // Caller initiates a call
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        const receiverSocketId = userSocketMap[userToCall];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", {
                signal: signalData,
                from,
                name,
                callType
            });
        }
    });

    // Receiver answers the call
    socket.on("answerCall", ({ to, signal }) => {
        const callerSocketId = userSocketMap[to];
        if (callerSocketId) {
            io.to(callerSocketId).emit("callAccepted", signal);
        }
    });

    // Relay ICE candidates
    socket.on("iceCandidate", ({ to, candidate }) => {
        const targetSocketId = userSocketMap[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("iceCandidate", candidate);
        }
    });

    // End call
    socket.on("endCall", ({ to }) => {
        const targetSocketId = userSocketMap[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("callEnded");
        }
    });
};
