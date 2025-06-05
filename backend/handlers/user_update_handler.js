import { timestamp } from '../utils/index.js';

export function registerUserUpdateHandlers(io, socket) {
    socket.on("update-user", ({ update }) => {
        if (!update.name && !update.email && !update.role) {
            console.log(`[${timestamp()}] User ${socket.user.id} update invalid. Payload:`, update)
            return; // update not valid
        }
        const roomIp = socket.handshake.address;
        console.log(`[${timestamp()}] User ${socket.user.id} updating info in ${roomIp}. Payload:`, update);
        socket.appClient = {...socket.appClient, ...update}
        
        socket.to(roomIp).emit("update-user", {
            fromSocketId: socket.id,
            update: socket.appClient,
        });

        // Emit to others in the room
        console.log(`[${timestamp()}] Emitted update-user from ${socket.user.id} to room ${roomIp}`);
    });
}