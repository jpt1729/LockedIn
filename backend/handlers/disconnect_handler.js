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
    console.log(socket.roomId)
    updateUserClientDetails(socket.roomId, userId, {active: false})
    socket.rooms.forEach(async (roomId) => {
      console.log(roomId);
      if (roomId !== socket.id) {
        const leaveInfo = {
          socketId: socket.id,
          userId: userId,
          name: userName,
        };
        io.to(roomId).emit("user_left", { ...leaveInfo, roomId });
        const room = await getCachedRoom(roomId);
        await updateUserClientDetails(room.id, userId, { active: false });
        

        console.log(
          `[${timestamp()}] Emitted user_left for ${userId} to room ${roomId}`
        );
      }
    });
  });
}
