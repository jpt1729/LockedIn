import { timestamp } from '../utils/index.js';

export function registerDisconnectHandler(io, socket) {
    socket.on('disconnect', (reason) => {
        const userId = socket.user?.id || 'UnknownUser';
        const userName = socket.user?.name || 'UnknownName';

        console.log(`[${timestamp()}] Socket ${socket.id} (User: ${userId}) disconnected: ${reason}`);

        socket.rooms.forEach(roomId => {
            if (roomId !== socket.id) {
                const leaveInfo = {
                    socketId: socket.id,
                    userId: userId,
                    name: userName
                };
                io.to(roomId).emit('user_left', { ...leaveInfo, roomId });
                console.log(`[${timestamp()}] Emitted user_left for ${userId} to room ${roomId}`);
            }
        });
    });
}