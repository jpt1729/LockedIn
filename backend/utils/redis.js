// lib/redis.ts
import Redis from "ioredis";

const globalForRedis = globalThis;

// Reuse existing Redis connection in development
const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL);

// Cache the Redis instance globally in dev
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export { redis };
