import { registerRoomHandlers } from './room_handler.js';
import { registerMessageHandlers } from './message_handler.js';
import { registerUserUpdateHandlers } from './user_update_handler.js';
import { registerDisconnectHandler } from './disconnect_handler.js';

import { timestamp } from '../utils/index.js';


export function onConnection(io, socket) {
    console.log(`[${timestamp()}] New authenticated connection established: ${socket.id}, User ID: ${socket.user.id}`);

    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerUserUpdateHandlers(io, socket);
    registerDisconnectHandler(io, socket);
}