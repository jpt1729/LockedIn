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
  socket.emit("joined-room-details", { room });

  const userInfoForRoom = {
    socketId: socket.id,
    id: socket.user.id,
    name: socket.user.name,
    image: socket.user.image,
    ...socket.user,
  };
  const client = await getCachedUserClient(room, userInfoForRoom);
  socket.roomId = room.id
  // Emit to others in the room
  socket
    .to(room.ip)
    .emit("user-joined", { roomId: room.id, user: client });
  console.log(`[${timestamp()}] Emitted user-joined to room ${room.id}`);
}
