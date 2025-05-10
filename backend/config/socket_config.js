import { NODE_ENV, NEXTJS_APP_URL } from './env.js'; // Import from our env config

export const socketOptions = {
    cors: {
        origin: NODE_ENV === 'production'
            ? NEXTAUTH_URL
            : "*",  
        methods: ["GET", "POST"]
    },
};