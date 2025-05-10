// For App Router: src/app/api/socket-token/route.js
import { auth } from "@/utils/auth"; // Adjust path to your auth.js
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.AUTH_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: AUTH_SECRET not configured for socket token generation.");
  // Consider how to handle this critical error, perhaps by preventing server startup
}

export const GET = auth(async function GET(req) {
  const session = req.auth; // Retrieves the NextAuth session

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized: No active session or user ID missing.' }, { status: 401 });
  }

  // Create a payload for the Socket.IO JWT
  const socketTokenPayload = {
    sub: session.user.id,    // 'sub' (subject) is standard for user ID
    id: session.user.id,     // Include id if your server expects it directly
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    // Add any other claims your Socket.IO server might need from the user
  };

  try {
    // Sign the token with the SAME AUTH_SECRET your Socket.IO server uses
    const socketToken = jwt.sign(socketTokenPayload, JWT_SECRET, { expiresIn: '15m' }); // Short-lived
    return NextResponse.json({ socketToken });
  } catch (error) {
    console.error("Error signing socket token:", error);
    return NextResponse.json({ error: 'Internal server error: Could not generate socket token.' }, { status: 500 });
  }
})