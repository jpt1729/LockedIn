import { timestamp } from "../utils/index.js"; // Assuming utils is one level up
import { getCachedRoom, getCachedUserClient } from "../utils/cache/index.js";

export function registerRoomHandlers(io, socket) {
  socket.on("join-room", ({ roomId }) => {
    if (!roomId) {
      console.warn(
        `[${timestamp()}] User ${socket.user.id} (${
          socket.id
        }) tried to join an undefined room.`
      );
      // Optionally emit an error back to the client
      // socket.emit("error_joining_room", { message: "Room ID is required." });
      return;
    }
    const room = getCachedRoom(socket.handshake.address);
    socket.join(room.id);
    console.log(
      `[${timestamp()}] User ${socket.user.id} (${socket.id}) joined room ${
        room.id
      }`
    );

    const userInfoForRoom = {
      socketId: socket.id,
      id: socket.user.id,
      name: socket.user.name,
      image: socket.user.image,
    };
    // Emit to others in the room
    socket
      .to(roomId)
      .emit("user-joined", { roomId: room.id, user: userInfoForRoom });
    console.log(`[${timestamp()}] Emitted user-joined to room ${room.id}`);
  });

  // Add other room-related handlers here, e.g., "leave-room"
  // socket.on("leave-room", ({ roomId }) => { ... });
}

export async function joinRoom(io, socket) {
  const room = await getCachedRoom(socket.handshake.address);
  socket.join(room.id);
  console.log(
    `[${timestamp()}] User ${socket.user.id} (${socket.id}) joined room ${
      room.id
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

  // Emit to others in the room
  socket
    .to(room.id)
    .emit("user-joined", { roomId: room.id, user: client });
  console.log(`[${timestamp()}] Emitted user-joined to room ${room.id}`);
}
