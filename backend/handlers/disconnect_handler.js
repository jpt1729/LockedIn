import { timestamp } from "../utils/index.js";
import { getCachedRoom } from "../utils/cache/index.js";

export function registerDisconnectHandler(io, socket) {
  socket.on("disconnect", (reason) => {
    const userId = socket.user?.id || "UnknownUser";

    const roomIp = socket.handshake.address;

    console.log(
      `[${timestamp()}] Socket ${
        socket.id
      } (User: ${userId}) disconnected: ${reason}`
    );
    socket.to(roomIp).emit("update-user", {
      fromSocketId: socket.id,
      update: { ...socket.appClient, active: false },
    });

    console.log(
      `[${timestamp()}] Emitted update-user from ${
        socket.user.id
      } to room ${roomIp}`
    );
  });
}
