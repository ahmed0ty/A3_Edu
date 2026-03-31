// import redisClient from "../config/redis.js";

// const testCache = async () => {
//   try {
//     console.log("----- START REDIS CACHE TEST -----");

//     const key = "test:key";
//     const value = { message: "Hello from Redis!" };

//     // تخزين البيانات في الكاش
//     await redisClient.setEx(key, 10, JSON.stringify(value)); // TTL 10s
//     console.log(`Value set in cache: ${JSON.stringify(value)}`);

//     // جلب البيانات من الكاش
//     const cached = await redisClient.get(key);
//     if (cached) {
//       console.log("Cache hit! Value retrieved from Redis:", JSON.parse(cached));
//     } else {
//       console.log("Cache miss!");
//     }

//     // تنظيف
//     await redisClient.del(key);
//     console.log("Cache cleared.");

//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// testCache();
