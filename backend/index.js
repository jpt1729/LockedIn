import http from "http";
import { Server } from "socket.io";

// Import configurations and handlers
import { SOCKET_PORT } from './config/env.js'; // Ensures env vars are loaded and validated first
import { socketOptions } from './config/socket_config.js';
import { authenticateSocket } from './middleware/auth.js';
import { onConnection } from './handlers/connection_handler.js';
import { getLocalIP, timestamp } from "./utils/index.js"; // Assuming utils/index.js exists

// Create HTTP server - you can add a basic health check or leave it minimal
const httpServer = http.createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: timestamp() }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Initialize Socket.IO server
const io = new Server(httpServer, socketOptions);

// Apply authentication middleware
io.use(authenticateSocket);

// Handle new connections
io.on("connection", (socket) => {
    onConnection(io, socket);
});

// Start the server
httpServer.listen(SOCKET_PORT, () => {
    const ip = getLocalIP();
    console.log(`\n[${timestamp()}] ✅ Socket.IO server running (PID: ${process.pid}):`);
    console.log(`- Local:   http://localhost:${SOCKET_PORT}`);
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        console.log(`- Network: http://${ip}:${SOCKET_PORT}`);
    }
    console.log(`- Mode:    ${process.env.NODE_ENV}`);
    console.log(`- Waiting for connections...`);
});

// Optional: Graceful shutdown
const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach(signal => {
    process.on(signal, () => {
        console.log(`\n[${timestamp()}] Received ${signal}. Shutting down gracefully...`);
        io.close(() => {
            console.log(`[${timestamp()}] Socket.IO server closed.`);
            httpServer.close(() => {
                console.log(`[${timestamp()}] HTTP server closed.`);
                // prisma.$disconnect(); // If you want to explicitly disconnect Prisma
                process.exit(0);
            });
        });

        // Force shutdown if graceful shutdown takes too long
        setTimeout(() => {
            console.error(`[${timestamp()}] Could not close connections in time, forcefully shutting down`);
            process.exit(1);
        }, 10000); // 10 seconds
    });
});