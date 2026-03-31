// // src/middlewares/cache.middleware.js
// import redisClient from "../utils/redis.js";

// export const cache = (keyGenerator, ttl = 3600) => async (req, res, next) => {
//   try {
//     const key = keyGenerator(req);

//     const cachedData = await redisClient.get(key);
//     if (cachedData) {
//       console.log(`Cache hit: ${key}`);
//       return res.status(200).json(JSON.parse(cachedData));
//     }

//     console.log(`Cache miss: ${key}`);
//     const originalSend = res.json.bind(res);

//     res.json = (data) => {
//       redisClient.setEx(key, ttl, JSON.stringify(data));
//       return originalSend(data);
//     };

//     next();
//   } catch (err) {
//     console.error("Cache middleware error:", err);
//     next();
//   }
// };

// src/middlewares/cache.middleware.js
import redisClient from "../config/redis.js";

export const cache =
  (keyGenerator, ttl = 3600) =>
  async (req, res, next) => {
    try {
      const key = keyGenerator(req);

      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`🔥 Cache hit: ${key}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      console.log(`❌ Cache miss: ${key}`);

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        redisClient.setEx(key, ttl, JSON.stringify(data));
        return originalJson(data);
      };

      next(); // 👈 مهم جدًا هنا
    } catch (err) {
      console.error("Cache middleware error:", err);
      next(err); // 👈 بدل next() فقط، بعث الخطأ
    }
  };
