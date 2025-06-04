import { timestamp } from "../utils/index.js";
import {
  getCachedRoom,
  updateUserClientDetails,
} from "../utils/cache/index.js";

export function registerDisconnectHandler(io, socket) {
  socket.on("disconnect", async (reason) => {
    const userId = socket.user?.id || "UnknownUser";
    const userName = socket.user?.name || "UnknownName";

    console.log(
      `[${timestamp()}] Socket ${
        socket.id
      } (User: ${userId}) disconnected: ${reason}`
    );
    const roomId = socket.roomId;
    const room = await getCachedRoom(socket.handshake.address);
    try {
      const updatedUserInfo = await updateUserClientDetails(roomId, userId, {
        active: false,
      });
      socket.to(room.ip).emit("update-user", {
        fromSocketId: socket.id,
        content: updatedUserInfo,
        roomId: roomId,
      });
      console.log(
        `[${timestamp()}] Emitted update-user from ${
          socket.user.id
        } to room ${roomId}`
      );
    } catch (err) {
      console.log(err);
    }
  });
}
