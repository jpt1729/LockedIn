import { redis } from "../redis.js";
import { prisma } from "../prisma.js";

function roomCacheKey(roomIp) {
  return `room:${roomIp}`;
}

export async function getCachedRoom(roomIp) {
  const key = roomCacheKey(roomIp);
  const cached = await redis.get(key);

  if (cached) return JSON.parse(cached);

  const room = await prisma.room.upsert({
    where: { ip: roomIp },
    include: { },
    update: {}, // no update if it already exists
    create: {
      ip: roomIp,
    },
  });

  if (room) {
    await redis.set(key, JSON.stringify(room), "EX", 600); // Cache for 10 min
  }
  
  return room;
}

export async function invalidateRoomCache(roomIp) {
  await redis.del(roomCacheKey(roomIp));
}

function userClientCacheKey(roomId, userId) {
  return `room:${roomId}${userId}`;
}

export async function getCachedUserClient(room, user) {
  const key = userClientCacheKey(room.id, user.id);
  const cached = await redis.get(key);

  if (cached) return JSON.parse(cached);

  const client = await prisma.client.upsert({
    where: {
      clientId: {
        roomId: room.id,
        userId: user.id,
      },
    },
    update: { active: true }, // no update if it already exists
    create: {
      userId: user.id,
      roomId: room.id,

      socketId: user.socketId,

      name: user.name,
      image: user.image,
      email: user.email,
      
      active: true,
    },
  });

  if (client) {
    await redis.set(key, JSON.stringify(client), "EX", 600); // Cache for 10 min
    await (invalidateRoomCache(room.ip))
  }
  
  return client;
}
export async function invalidateUserClientCache(roomId, userId) {
  await redis.del(userClientCacheKey(roomId, userId));
}

export async function updateUserClientDetails(roomId, userId, newData) {

  const updatedClient = await prisma.client.update({
    where: { 
      clientId: {
        roomId: roomId,
        userId: userId,
      }
    },
    data: newData, 
    include: {
      room: true
    }
  });

  if (updatedClient) {
    const key = userClientCacheKey(roomId, userId);
    await redis.set(key, JSON.stringify(updatedClient), "EX", 600);

    if (updatedClient.room.ip) {
        await updateCachedRoomWithNewClientData(updatedClient.room.ip, updatedClient); // A new function you might write
    }
  }
  return updatedClient;
}

// Hypothetical function to update room cache
async function updateCachedRoomWithNewClientData(roomIp, updatedClientData) {
    const roomKey = roomCacheKey(roomIp);
    const cachedRoomJSON = await redis.get(roomKey);
    if (cachedRoomJSON) {
        const room = JSON.parse(cachedRoomJSON);
        // Logic to update the 'clients' array within the cached 'room' object
        const clientIndex = room.clients.findIndex(c => c.id === updatedClientData.id); // Assuming client has an 'id'
        if (clientIndex !== -1) {
            room.clients[clientIndex] = updatedClientData;
        } else {
            room.clients.push(updatedClientData); // Or add if it's a new client for the room
        }
        await redis.set(roomKey, JSON.stringify(room), "EX", 600);
    }
}