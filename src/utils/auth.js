// src/utils/auth.js
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken (sign is used here)
import { prisma } from "./prisma";

// Load the secret from environment variables
const JWT_SECRET = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  console.error("\n!!! Missing NEXTAUTH_SECRET environment variable for NextAuth !!!\n");
  // Optionally throw an error during build/startup in development
  // throw new Error("NEXTAUTH_SECRET is not set."); 
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // --- Use JWT Strategy ---
  session: {
    strategy: "jwt", 
  },
  // --- ---
  providers: [
    Google({
      // Ensure your Google Provider has client ID/Secret configured
      // clientId: process.env.GOOGLE_CLIENT_ID,
      // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // --- Customize JWT Payload ---
    async jwt({ token, user, account, profile }) {
      // On initial sign in (when user object is present)
      if (user) {
        token.id = user.id; // Add user ID from database user object
        // Optionally add other non-sensitive fields you need on the socket server
        token.name = user.name;
        token.email = user.email; // Be mindful if email is sensitive
        token.image = user.image; 
      }
      // This token object is then encoded into the JWT
      return token;
    },
    // --- Customize Session Object ---
    async session({ session, token }) {
      // Add properties from the JWT token to the session object
      // This makes `id`, `name`, etc., available via useSession() or auth()
      if (token?.id) session.user.id = token.id;
      if (token?.name) session.user.name = token.name;
      if (token?.email) session.user.email = token.email;
      if (token?.image) session.user.image = token.image;

      // --- Create and add the raw JWT for the socket ---
      // We re-sign the relevant token payload to create the accessToken
      // This ensures it uses the latest token data.
      if (JWT_SECRET) {
          const payloadToSign = {
              sub: token.id, // Standard 'subject' claim for user ID
              name: token.name,
              email: token.email,
              image: token.image,
              iat: token.iat, // Issued at timestamp
              exp: token.exp, // Expiration timestamp
              jti: token.jti  // JWT ID
              // Add any other claims needed
          };
          session.accessToken = jwt.sign(payloadToSign, JWT_SECRET);
      } else {
          console.error("Cannot sign accessToken for session: NEXTAUTH_SECRET is missing.");
      }
      // --- ---
      
      return session;
    },
    // Keep your signIn callback
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        return profile.email_verified;
      }
      return true; 
    },
  },
  // --- Provide the Secret ---
  secret: JWT_SECRET, 
  // --- ---
});