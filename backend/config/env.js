import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { timestamp } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env.local');
// If .env.local is inside socket-backend/ (one level above socket-backend/config/)
// const envPath = path.resolve(__dirname, '../.env.local');

let loadedEnvPath = null;

export function loadEnv() {
    if (loadedEnvPath) return; // Ensure it runs only once

    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.warn(`[${timestamp()}] Warning: Could not load .env file from ${envPath}. Using system environment variables if available. Error: ${result.error.message}`);
    } else if (result.parsed) {
        console.log(`[${timestamp()}] Loaded environment variables from ${envPath}`);
    }
    loadedEnvPath = envPath; // Mark as loaded

    // Validate critical environment variables
    if (!process.env.AUTH_SECRET) {
        console.error(`\n[${timestamp()}] FATAL ERROR: AUTH_SECRET environment variable is not set for the Socket.IO server.\nPlease ensure it's available to this Node.js process.\n`);
        process.exit(1);
    }
    if (!process.env.SOCKET_PORT) {
        console.warn(`[${timestamp()}] Warning: SOCKET_PORT not set, defaulting to 5001 for the socket server as an example.`);
        // You might want to process.exit(1) if this is critical
    }
    if (process.env.NODE_ENV === 'production' && !process.env.YOUR_NEXTJS_APP_URL) {
         console.warn(`\n[${timestamp()}] WARNING: YOUR_NEXTJS_APP_URL environment variable is not set for production CORS configuration.\n`);
        // You might want to process.exit(1) if this is critical for production
    }
}

// Call loadEnv immediately when this module is imported for the first time
loadEnv();

// Export the validated/used environment variables
export const JWT_SECRET = process.env.AUTH_SECRET;
export const SOCKET_PORT = process.env.SOCKET_PORT || 5000; // Default if not set
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const NEXTJS_APP_URL = process.env.YOUR_NEXTJS_APP_URL; // Will be undefined if not set