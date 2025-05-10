import { timestamp } from '../utils/index.js'; // Assuming utils is one level up

export function registerRoomHandlers(io, socket) {
    socket.on("join-room", ({ roomId }) => {
        if (!roomId) {
            console.warn(`[${timestamp()}] User ${socket.user.id} (${socket.id}) tried to join an undefined room.`);
            // Optionally emit an error back to the client
            // socket.emit("error_joining_room", { message: "Room ID is required." });
            return;
        }
        socket.join(roomId);
        console.log(`[${timestamp()}] User ${socket.user.id} (${socket.id}) joined room ${roomId}`);

        const userInfoForRoom = {
            socketId: socket.id,
            id: socket.user.id,
            name: socket.user.name,
            image: socket.user.image
        };
        // Emit to others in the room
        socket.to(roomId).emit("user-joined", { roomId, user: userInfoForRoom });
        console.log(`[${timestamp()}] Emitted user-joined to room ${roomId}`);
    });

    // Add other room-related handlers here, e.g., "leave-room"
    // socket.on("leave-room", ({ roomId }) => { ... });
}