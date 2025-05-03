import { Server } from "socket.io";
import http from "http";

import { getLocalIP, timestamp } from "./utils/index.js";
import { prisma } from "./prisma.js";

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // adjust as needed
  },
});

io.on("connection", (socket) => {
  console.log(`[${timestamp()}] New connection: ${socket.id}`);

  socket.on("join-room", ({ roomId, user}) => {
    socket.join(roomId);
    console.log(`[${timestamp()}] ${socket.id} joined room ${roomId}`);
    console.log({socketId: socket.id, ...user})
    // Optionally send an acknowledgment or sync state
    socket.to(roomId).emit("user-joined", { roomId, user: {socketId: socket.id, ...user} });
  });

  socket.on("message", ({ roomId, message }) => {
    // Emit to everyone in the room except sender
    socket.to(roomId).emit("message", {
      from: socket.id,
      content: message,
    });
    console.log(`[${timestamp()}] ${socket.id} message in ${roomId}: ${message}`)
  });

  socket.on("update-user", ({ roomId, user }) => {
    // Emit to everyone in the room except sender
    socket.to(roomId).emit("update-user", {
      from: socket.id,
      content: user,
    });
    console.log(`[${timestamp()}] ${socket.id} message in ${roomId}: ${message}`)
  });
});

// Start server
const PORT = 5000;
httpServer.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`✅ Socket.IO server running:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://${ip}:${PORT}`);
});
