// src/utils/auth.js
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken (sign is used here)
import { prisma } from "./prisma";

// Load the secret from environment variables
const JWT_SECRET = process.env.AUTH_SECRET;

if (!JWT_SECRET) {
  console.error("\n!!! Missing NEXTAUTH_SECRET environment variable for NextAuth !!!\n");
  // Optionally throw an error during build/startup in development
  // throw new Error("NEXTAUTH_SECRET is not set."); 
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
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
    // Keep your signIn callback
    async signIn({ account, profile }) {
      console.log(profile)
      if (account.provider === "google") {
        return profile.email_verified
      }
      return true; 
    },
  },
  secret: JWT_SECRET, 
});