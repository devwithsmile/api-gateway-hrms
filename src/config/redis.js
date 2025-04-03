import redis from "redis";

// Redis client setup
let redisClient;

// Connect to Redis
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    await redisClient.connect();
    console.log("Connected to Redis");
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return null;
  }
};

export { connectRedis, redisClient };
