import { redisClient } from '../config/redis.js';

// Cache middleware
const cacheMiddleware = async (req, res, next) => {
  // Skip caching for non-GET requests
  if (req.method !== "GET") {
    return next();
  }

  const cacheKey = `cache:${req.originalUrl}`;
  const cacheDuration = process.env.CACHE_DURATION_SECONDS || 300; // Default to 5 minutes

  try {
    // Check if data exists in cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for:", req.originalUrl);
      return res.json(JSON.parse(cachedData));
    }

    // Store the original send function
    const originalSend = res.send;

    // Override the send function to cache the response
    res.send = function (body) {
      if (res.statusCode === 200) {
        // Cache successful responses for configured duration
        redisClient.setEx(cacheKey, cacheDuration, body);
        console.log(`Cached response for ${req.originalUrl} for ${cacheDuration} seconds`);
      }

      // Call the original send function
      originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error("Cache error:", error);
    next();
  }
};

export default cacheMiddleware;
