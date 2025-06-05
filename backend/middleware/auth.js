import { timestamp } from "../utils/index.js";

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.error(
      `[${timestamp()}] Auth Error (Socket ID: ${
        socket.id
      }): No token provided.`
    );
    return next(new Error("Authentication error: No token provided."));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(
        `[${timestamp()}] Auth Error (Socket ID: ${
          socket.id
        }): Invalid token. Error: ${err.message}`
      );
      return next(new Error("Authentication error: Invalid token."));
    }

    socket.user = {
      id: decoded.sub || decoded.id,
      name: decoded.name,
      email: decoded.email,
      image: decoded.image,
      ...decoded
      // Add other fields as needed from your JWT payload
    };

    socket.appClient = {
      id: decoded.sub || decoded.id,
      name: decoded.name,
      role: "",
      email: decoded.email,
      image: decoded.image,
      connected: new Date(),
      // Add other fields as needed from your JWT payload
    };

    console.log(
      `[${timestamp()}] Auth Success: User ${socket.user.id} (${
        socket.user.name
      }) connected (Socket ID: ${socket.id})`
    );
    next();
  });
}
