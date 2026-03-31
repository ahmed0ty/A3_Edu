import redis from "../config/redis.js";

export const cache =
  (keyGenerator, ttl = 3600) =>
  async (req, res, next) => {
    try {
      const key = keyGenerator(req);

      const cachedData = await redis.get(key);

      if (cachedData) {
        console.log(`🔥 Cache hit: ${key}`);
        return res.status(200).json(
          typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData
        );
      }

      console.log(`❌ Cache miss: ${key}`);

      const originalJson = res.json.bind(res);

      res.json = async (data) => {
        try {
          await redis.set(key, JSON.stringify(data), { ex: ttl });
        } catch (error) {
          console.error("Cache set error:", error);
        }

        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };