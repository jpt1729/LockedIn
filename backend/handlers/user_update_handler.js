import { timestamp } from '../utils/index.js';

export function registerUserUpdateHandlers(io, socket) {
    socket.on("update-user", ({ roomId, user }) => {
        // Validate roomId and user payload
        if (!roomId || !user) {
            console.warn(`[${timestamp()}] User ${socket.user.id} (${socket.id}) sent invalid update-user payload for room ${roomId}. Payload:`, user);
            // socket.emit("error_updating_user", { message: "Room ID and user data are required." });
            return;
        }
        console.log(`[${timestamp()}] User ${socket.user.id} updating info in ${roomId}. Payload:`, user);

        const updatedUserInfo = {
            id: socket.user.id, // ID from authenticated socket.user, should not be changed by payload
            name: user.name || socket.user.name,
            image: user.image || socket.user.image,
            // ... handle other fields carefully, only allowing updates to specific fields
        };

        // Optionally, update a central store of connected users here if you maintain one

        // Emit to others in the room
        socket.to(roomId).emit("update-user", {
            fromSocketId: socket.id,
            content: updatedUserInfo,
            roomId: roomId
        });
        console.log(`[${timestamp()}] Emitted update-user from ${socket.user.id} to room ${roomId}`);
    });
}