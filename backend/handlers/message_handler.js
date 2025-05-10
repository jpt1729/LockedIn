import { timestamp } from '../utils/index.js';

export function registerMessageHandlers(io, socket) {
    socket.on("message", ({ roomId, message }) => {
        if (!roomId || message === undefined || message === null) {
            console.warn(`[${timestamp()}] User ${socket.user.id} (${socket.id}) sent an invalid message to room ${roomId}. Message: ${message}`);
            // socket.emit("error_sending_message", { message: "Room ID and message are required." });
            return;
        }
        console.log(`[${timestamp()}] User ${socket.user.id} message in ${roomId}: ${message}`);

        const senderInfo = {
            socketId: socket.id,
            id: socket.user.id,
            name: socket.user.name,
            image: socket.user.image
        };
        // Emit to everyone in the room including the sender
        io.in(roomId).emit("message", {
            message: message,
            sender: senderInfo,
            roomId: roomId // Good to include roomId in the payload for client-side routing
        });
        console.log(`[${timestamp()}] Broadcast message to room ${roomId}`);
    });
}