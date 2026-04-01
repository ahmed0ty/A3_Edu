// // src/modules/course/course.controller.js
// import * as courseService from "./course.service.js";
// import EnrollmentModel from "../../DB/models/enrollment.model.js";
// import { courseKey, coursesKey, lessonsKey } from "../../utils/cacheKeys.js";
// import { clearCache, clearCacheByPrefix } from "../../utils/cache.js";
// import CourseModel from "../../DB/models/course.model.js";
// import redis from "../../config/redis.js";
// import { getIO } from "../../../socket.js";

// // ================= COMPLETE LESSON =================

// export const completeLesson = async (req, res, next) => {
//   try {
//     const { lessonIndex } = req.body;
//     const courseId = req.params.id;
//     const userId = req.user._id;

//     // 🔥 business logic
//     const result = await courseService.completeLesson(
//       courseId,
//       userId,
//       lessonIndex,
//     );

//     // 🔥 CACHE INVALIDATION
//     await clearCache(courseKey(courseId));
//     await clearCache(lessonsKey(courseId));

//     // 🔥 SOCKET EVENT
//     const io = getIO();

//     io.to(courseId).emit("lesson:completed", {
//       courseId,
//       userId,
//       lessonIndex,
//     });

//     res.status(200).json({
//       message: "Lesson marked as completed",
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= CREATE COURSE =================
// export const createCourse = async (req, res, next) => {
//   try {
//     const course = await courseService.createCourse(req.body, req.user._id);

//     // 🔥 CACHE INVALIDATION
//     await clearCacheByPrefix("courses:");

//     // 🔥 SOCKET EVENT
//     const io = getIO();

//     io.emit("course:created", {
//       courseId: course._id,
//       title: course.title,
//       instructor: req.user._id,
//     });

//     res.status(201).json({
//       message: "Course created successfully",
//       data: course,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// // ================= GET ALL COURSES =================
// export const getCourses = async (req, res, next) => {
//   try {
//     const userId = req.user?._id;
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 20;

//     const cacheKey = coursesKey(page, limit);

//     let courses;

//     // 🔥 1. check cache
// await redis.set(cacheKey, JSON.stringify(courses), { ex: 3600 });

//     if (cachedData) {
//       courses = JSON.parse(cachedData);
//     } else {
//       // 🔥 2. DB fallback (بدون user logic)
//       courses = await CourseModel.find()
//         .populate("instructor", "name email")
//         .select(
//           "title description instructor price isPublished thumbnail instructorPhone",
//         )
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean();

//       // 🔥 3. save cache (RAW فقط)
//       await redisClient.setEx(cacheKey, 3600, JSON.stringify(courses));
//     }

//     // ================= NO USER =================
//     if (!userId) {
//       return res.status(200).json({
//         source: cachedData ? "cache" : "db",
//         data: courses.map((course) => ({
//           ...course,
//           hasAccess: course.price === 0,
//           enrollment: null,
//         })),
//       });
//     }

//     // ================= ENROLLMENTS =================
//     const enrollments = await EnrollmentModel.find({
//       student: userId,
//     })
//       .select("course approvalStatus")
//       .lean();

//     const enrollmentMap = new Map();

//     for (const e of enrollments) {
//       enrollmentMap.set(String(e.course), e);
//     }

//     // ================= MERGE =================
//     const finalCourses = courses.map((course) => {
//       const enrollment = enrollmentMap.get(String(course._id));

//       return {
//         ...course,
//         enrollment: enrollment || null,
//         enrollmentId: enrollment?._id || null,
//         hasAccess:
//           enrollment?.approvalStatus === "accepted" || course.price === 0,
//       };
//     });

//     res.status(200).json({
//       source: cachedData ? "cache" : "db",
//       data: finalCourses,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// // ================= GET SINGLE COURSE =================
// export const getCourse = async (req, res, next) => {
//   try {
//     const courseId = req.params.id;
//     const userId = req.user?._id?.toString();

//     if (!courseId) {
//       return res.status(400).json({ message: "Course ID is required" });
//     }

//     const cacheKey = courseKey(courseId, userId);

//     // 🔥 1. Check cache (per-user cache)
//     const cachedCourse = await redisClient.get(cacheKey);

//     if (cachedCourse) {
//       return res.status(200).json({
//         source: "cache",
//         data: JSON.parse(cachedCourse),
//       });
//     }

//     // 🔥 2. DB fallback
//     const course = await courseService.getCourseById(courseId, userId);

//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // 🔥 3. Save to cache (user-specific)
//     await redisClient.setEx(cacheKey, 3600, JSON.stringify(course));

//     return res.status(200).json({
//       source: "db",
//       data: course,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// // ================= UPDATE COURSE =================
// export const updateCourse = async (req, res, next) => {
//   try {
//     const courseId = req.params.id;
//     const instructorId = req.user._id;

//     const course = await courseService.updateCourse(
//       courseId,
//       instructorId,
//       req.body,
//     );

//     if (!course) {
//       return res.status(404).json({
//         message: "Course not found or not authorized",
//       });
//     }

//     // 🔥 الكاش عندك أصلاً بيتعمل في السيرفس، فمش لازم نكرر إلا لو عايز تشدد
//     // (اختياري فقط لو عايز safety إضافي)
//     await clearCacheByPrefix("courses");

//     res.status(200).json({
//       message: "Course updated successfully",
//       data: course,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= DELETE COURSE =================
// export const deleteCourse = async (req, res, next) => {
//   try {
//     const courseId = req.params.id;
//     const instructorId = req.user._id;

//     const course = await courseService.deleteCourse(courseId, instructorId);

//     if (!course) {
//       return res.status(404).json({
//         message: "Course not found or not authorized",
//       });
//     }

//     res.status(200).json({
//       message: "Course deleted successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= CHECK ACCESS =================
// export const checkAccess = async (req, res, next) => {
//   try {
//     const courseId = req.params.id;
//     const userId = req.user._id;

//     // 🔥 1. get enrollment only
//     const enrollment = await EnrollmentModel.findOne({
//       student: userId,
//       course: courseId,
//     }).lean();

//     // 🔥 2. get only price (light query)
//     let coursePrice = 0;

//     if (!enrollment || enrollment.approvalStatus !== "accepted") {
//       const course = await CourseModel.findById(courseId)
//         .select("price")
//         .lean();

//       if (!course) {
//         return res.status(404).json({ message: "Course not found" });
//       }

//       coursePrice = course.price;
//     }

//     // 🔥 3. access logic
//     const hasAccess =
//       enrollment?.approvalStatus === "accepted" || coursePrice === 0;

//     res.status(200).json({ hasAccess });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getMyCourses = async (req, res, next) => {
//   try {
//     const instructorId = req.user._id;

//     const cacheKey = `myCourses:${instructorId}`;

//     // 🔥 1. check cache
//     const cached = await redisClient.get(cacheKey);

//     if (cached) {
//       return res.json({
//         success: true,
//         source: "cache",
//         data: JSON.parse(cached),
//       });
//     }

//     // 🔥 2. DB query
//     const courses = await CourseModel.find({
//       instructor: instructorId,
//     })
//       .select("title description price thumbnail isPublished createdAt")
//       .lean();

//     // 🔥 3. save cache
//     await redisClient.setEx(cacheKey, 3600, JSON.stringify(courses));

//     res.json({
//       success: true,
//       source: "db",
//       data: courses,
//     });
//   } catch (err) {
//     console.error("❌ ERROR:", err.message);

//     res.status(500).json({
//       message: "Error fetching courses",
//     });
//   }
// };

































// src/modules/course/course.controller.js
import * as courseService from "./course.service.js";
import EnrollmentModel from "../../DB/models/enrollment.model.js";
import { courseKey, coursesKey, lessonsKey } from "../../utils/cacheKeys.js";
import { clearCache, clearCacheByPrefix } from "../../utils/cache.js";
import CourseModel from "../../DB/models/course.model.js";
import redis from "../../config/redis.js";
import { getIO } from "../../../socket.js";

// ================= COMPLETE LESSON =================

export const completeLesson = async (req, res, next) => {
  try {
    const { lessonIndex } = req.body;
    const courseId = req.params.id;
    const userId = req.user._id;

    const result = await courseService.completeLesson(
      courseId,
      userId,
      lessonIndex,
    );

    await clearCache(courseKey(courseId));
    await clearCache(lessonsKey(courseId));

    const io = getIO();

    io.to(courseId).emit("lesson:completed", {
      courseId,
      userId,
      lessonIndex,
    });

    res.status(200).json({
      message: "Lesson marked as completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ================= CREATE COURSE =================
export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user._id);

    await clearCacheByPrefix("courses:");
await clearCacheByPrefix("myCourses:");

    const io = getIO();

    io.emit("course:created");

    res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET ALL COURSES =================
export const getCourses = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const courses = await CourseModel.find()
      .populate("instructor", "name email")
      .select("title description instructor price isPublished thumbnail instructorPhone")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (!userId) {
      return res.status(200).json({
        source: "db",
        data: courses.map((course) => ({
          ...course,
          hasAccess: course.price === 0,
          enrollment: null,
        })),
      });
    }

    const enrollments = await EnrollmentModel.find({ student: userId })
      .select("course approvalStatus")
      .lean();

    const enrollmentMap = new Map();
    for (const e of enrollments) {
      enrollmentMap.set(String(e.course), e);
    }

    const finalCourses = courses.map((course) => {
      const enrollment = enrollmentMap.get(String(course._id));
      return {
        ...course,
        enrollment: enrollment || null,
        enrollmentId: enrollment?._id || null,
        hasAccess: enrollment?.approvalStatus === "accepted" || course.price === 0,
      };
    });

    res.status(200).json({
      source: "db",
      data: finalCourses,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?._id?.toString();

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await courseService.getCourseById(courseId, userId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      source: "db",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE COURSE =================
export const updateCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const instructorId = req.user._id;

    const course = await courseService.updateCourse(
      courseId,
      instructorId,
      req.body,
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found or not authorized",
      });
    }

    await clearCacheByPrefix("courses");

    res.status(200).json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// ================= DELETE COURSE =================
export const deleteCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const instructorId = req.user._id;

    const course = await courseService.deleteCourse(courseId, instructorId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found or not authorized",
      });
    }

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= CHECK ACCESS =================
export const checkAccess = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const enrollment = await EnrollmentModel.findOne({
      student: userId,
      course: courseId,
    }).lean();

    let coursePrice = 0;

    if (!enrollment || enrollment.approvalStatus !== "accepted") {
      const course = await CourseModel.findById(courseId)
        .select("price")
        .lean();

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      coursePrice = course.price;
    }

    const hasAccess =
      enrollment?.approvalStatus === "accepted" || coursePrice === 0;

    res.status(200).json({ hasAccess });
  } catch (err) {
    next(err);
  }
};

export const getMyCourses = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    const cacheKey = `myCourses:${instructorId}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        data: typeof cached === "string" ? JSON.parse(cached) : cached,
      });
    }

    const courses = await CourseModel.find({
      instructor: instructorId,
    })
      .select("title description price thumbnail isPublished createdAt")
      .lean();

    await redis.set(cacheKey, JSON.stringify(courses), { ex: 300 });

    res.json({
      success: true,
      source: "db",
      data: courses,
    });
  } catch (err) {
    console.error("❌ ERROR:", err.message);

    res.status(500).json({
      message: "Error fetching courses",
    });
  }
};