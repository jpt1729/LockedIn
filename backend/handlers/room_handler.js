import { timestamp } from "../utils/index.js";
import { getCachedRoom, getCachedUserClient } from "../utils/cache/index.js";

export async function joinRoom(io, socket) {
  const room = await getCachedRoom(socket.handshake.address);
  socket.join(room.ip);
  console.log(
    `[${timestamp()}] User ${socket.user.id} (${socket.id}) joined room ${
      room.ip
    }`
  );
  socket.emit("joined-room-details", { ...room, clients: getRoomUsers(io, socket, room.ip) });

  socket.roomId = room.id;
  // Emit to others in the room
  socket.to(room.ip).emit("user-joined", { roomId: room.id, user: socket.appClient });
  console.log(`[${timestamp()}] Emitted user-joined to room ${room.id}`);
}

export function getRoomUsers(io, socket, roomIp) {
  const room = io.sockets.adapter.rooms.get(roomIp);
  const otherUsers = [];

  if (room) {
    for (const socketId of room) {
      // Skip the current user's socket
      if (socketId === socket.id) {
        continue;
      }

      const otherSocket = io.sockets.sockets.get(socketId);
      if (otherSocket && otherSocket.appClient) {
        // Check if user data exists
        otherUsers.push({
          ...otherSocket.appClient,      
        });
      }
    }
  }
  return otherUsers;
}
