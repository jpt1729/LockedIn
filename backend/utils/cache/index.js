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
  console.log(room)
  return room;
}

export async function invalidateRoomCache(roomIp) {
  await redis.del(roomCacheKey(roomIp));
}
