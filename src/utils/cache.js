// import redisClient from "./redis.js";

// // مسح keys عادية
// export const clearCache = async (keys) => {
//   if (!Array.isArray(keys)) keys = [keys];

//   for (const key of keys) {
//     await redisClient.del(key);
//     console.log(`Cache cleared: ${key}`);
//   }
// };

// // مسح كل keys تبدأ بـ prefix
// export const clearCacheByPrefix = async (prefix) => {
//   const keys = await redisClient.keys(`${prefix}*`);
//   if (keys.length > 0) {
//     // ⚡ هنا المهم: نفتح المصفوفة بـ ...keys
//     await redisClient.del(...keys);
//     console.log(`Cache cleared for prefix: ${prefix}`, keys);
//   } else {
//     console.log(`No cache keys found for prefix: ${prefix}`);
//   }
// };

import redisClient from "../config/redis.js";

// ================= CLEAR SPECIFIC KEYS =================
export const clearCache = async (keys) => {
  if (!keys) return;
  if (!Array.isArray(keys)) keys = [keys];

  for (const key of keys) {
    if (!key) continue;
    await redisClient.del(key);
    console.log(`🗑 Cache cleared: ${key}`);
  }
};

// ================= CLEAR BY PREFIX =================
export const clearCacheByPrefix = async (prefix) => {
  if (!prefix) return;

  const keys = await redisClient.keys(`${prefix}*`);

  if (keys.length > 0) {
    await redisClient.del(...keys);
    console.log(`🗑 Cache cleared for prefix: ${prefix}`, keys);
  } else {
    console.log(`⚠️ No cache keys found for prefix: ${prefix}`);
  }
};

// ================= CLEAR ALL COURSE-RELATED CACHE =================
// ✅ استخدم الدالة دي في أي حاجة بتأثر على الكورسات
export const clearCourseCache = async (courseId = null) => {
  await clearCacheByPrefix("courses:");

  if (courseId) {
    await clearCacheByPrefix(`course:${courseId}`);
    await clearCacheByPrefix(`lessons:course=${courseId}`);
    await clearCacheByPrefix(`quizzes:course=${courseId}`);
  }
};

// ================= CLEAR ALL LESSON-RELATED CACHE =================
export const clearLessonCache = async (lessonId = null, courseId = null) => {
  if (lessonId) await clearCacheByPrefix(`lesson:${lessonId}`);
  if (courseId) await clearCacheByPrefix(`lessons:course=${courseId}`);
};
