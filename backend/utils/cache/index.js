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
    include: { clients: true },
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

      name: user.name,
      image: user.image,
      //email: user.email,

      active: true,
    },
  });

  if (client) {
    await redis.set(key, JSON.stringify(client), "EX", 600); // Cache for 10 min
    await (invalidateRoomCache(room.ip))
  }
  
  return client;
}
export async function invalidateRoomCache(roomIp) {
  await redis.del(roomCacheKey(roomIp));
}
