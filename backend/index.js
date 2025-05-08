import dotenv from 'dotenv';
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // To get __dirname in ES Modules

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path to the .env.local file in the project root
const envPath = path.resolve(__dirname, '../.env.local'); 

// Load the .env.local file
const result = dotenv.config({ path: envPath }); 

if (result.error) {
    console.warn(`[${timestamp()}] Warning: Could not load .env.local file from ${envPath}. Ensure it exists if needed. Error: ${result.error.message}`);
    // Don't throw an error, maybe the vars are set globally in production
} else if (result.parsed) {
    console.log(`[${timestamp()}] Loaded environment variables from ${envPath}`);
}
// --
import { Server } from "socket.io";
import http from "http";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { getLocalIP, timestamp } from "./utils/index.js";

import { prisma } from "./prisma.js"; 

// --- Authentication Setup ---
const JWT_SECRET = process.env.NEXTAUTH_SECRET; 
if (!JWT_SECRET) {
  console.error("\nFATAL ERROR: NEXTAUTH_SECRET environment variable is not set for the Socket.IO server.\nPlease ensure it's available to this Node.js process.\n");
  process.exit(1); 
}

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    // IMPORTANT: Restrict this in production!
    origin: process.env.NODE_ENV === 'production' 
            ? 'YOUR_NEXTJS_APP_URL' // Replace with your frontend URL
            : "*", 
    methods: ["GET", "POST"]
  },
});

// --- Authentication Middleware ---
io.use((socket, next) => {
  // Extract token from the handshake payload sent by the client
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.error(`[${timestamp()}] Auth Error (Socket ID: ${socket.id}): No token provided.`);
    // Disconnect explicitly on auth failure if desired
    // socket.disconnect(true); 
    return next(new Error("Authentication error: No token provided."));
  }

  // Verify the token using the SAME secret key
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(`[${timestamp()}] Auth Error (Socket ID: ${socket.id}): Invalid token. Error: ${err.message}`);
      // socket.disconnect(true);
      return next(new Error("Authentication error: Invalid token."));
    }

    // --- Token is valid ---
    // Attach user information from the decoded token to the socket object
    // Adjust fields based on your JWT payload in Step 1
    socket.user = {
      id: decoded.sub || decoded.id, // Use 'sub' (subject) or your custom 'id' field
      name: decoded.name,
      email: decoded.email,
      image: decoded.image,
      // Add other fields as needed
    };
    
    console.log(`[${timestamp()}] Auth Success: User ${socket.user.id} (${socket.user.name}) connected (Socket ID: ${socket.id})`);
    next(); // Proceed with the connection
  });
});
// --- ---

io.on("connection", (socket) => {
  // GUARANTEED: Only sockets that passed the middleware reach here.
  // 'socket.user' contains the authenticated user data.
  console.log(`[${timestamp()}] New authenticated connection handler: ${socket.id}, User ID: ${socket.user.id}`);

  // Store connected user info if needed (e.g., for broadcasting who is online)
  // Example: Map<userId, { socketId, name, image, ... }>
  // connectedUsers.set(socket.user.id, { socketId: socket.id, ...socket.user });

  socket.on("join-room", ({ roomId }) => { 
    // User info is already on socket.user
    socket.join(roomId);
    console.log(`[${timestamp()}] User ${socket.user.id} (${socket.id}) joined room ${roomId}`);
    
    // Prepare user info to broadcast (don't send sensitive data if not needed)
    const userInfoForRoom = { 
        socketId: socket.id, // Useful for client-side differentiation
        id: socket.user.id, 
        name: socket.user.name, 
        image: socket.user.image 
        // Add other fields safe to share
    };
    socket.to(roomId).emit("user_joined", { roomId, user: userInfoForRoom });
    console.log(`[${timestamp()}] Emitted user_joined to room ${roomId}`);
  });

  socket.on("message", ({ roomId, message }) => {
    console.log(`[${timestamp()}] User ${socket.user.id} message in ${roomId}: ${message}`);
    
    const senderInfo = { 
        socketId: socket.id, 
        id: socket.user.id, 
        name: socket.user.name,
        image: socket.user.image 
    };
    // Emit message WITH sender info attached
    io.in(roomId).emit("message", { 
        message: message, 
        sender: senderInfo 
    });
    console.log(`[${timestamp()}] Broadcast message to room ${roomId}`);
  });

  socket.on("update-user", ({ roomId, user }) => {
    // 'user' contains updates from the client, 'socket.user' has authenticated baseline
    console.log(`[${timestamp()}] User ${socket.user.id} updating info in ${roomId}. Payload:`, user);
    
    // Decide how to merge/handle updates. Example: prioritize client payload for updatable fields
    const updatedUserInfo = { 
      id: socket.user.id, // ID should not change
      name: user.name || socket.user.name, // Allow name update from payload
      image: user.image || socket.user.image, // Allow image update
      // ... handle other fields
    };

    // You might want to update your central store of connected users here too
    // connectedUsers.set(socket.user.id, { socketId: socket.id, ...updatedUserInfo });

    socket.to(roomId).emit("update-user", {
      fromSocketId: socket.id, // Distinguish sender socket
      content: updatedUserInfo, 
    });
    console.log(`[${timestamp()}] Emitted update-user from ${socket.user.id} to room ${roomId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[${timestamp()}] Socket ${socket.id} (User: ${socket.user?.id}) disconnected: ${reason}`);
    
    // --- Clean up user state ---
    // Example: Remove from central store
    // if (socket.user) {
    //     connectedUsers.delete(socket.user.id);
    // }

    // Notify rooms the user was in
    // socket.rooms contains the socket ID itself and any rooms joined
    socket.rooms.forEach(roomId => {
      if (roomId !== socket.id) { // Don't emit to the socket's own "room"
        const leaveInfo = { socketId: socket.id, userId: socket.user?.id, name: socket.user?.name };
        io.to(roomId).emit('user_left', leaveInfo);
        console.log(`[${timestamp()}] Emitted user_left for ${socket.user?.id} to room ${roomId}`);
      }
    });
    // --- ---
  });
});

// Start server (rest of your index.js)
const PORT = process.env.SOCKET_PORT || 5000; // Use env var if possible
httpServer.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`\n✅ Socket.IO server running (PID: ${process.pid}):`);
  console.log(`- Local:   http://localhost:${PORT}`);
  if(ip !== 'localhost') {
      console.log(`- Network: http://${ip}:${PORT}`);
  }
  console.log(`- Waiting for connections...`);
});