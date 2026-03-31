// import CourseModel from "../../DB/models/course.model.js";
// import EnrollmentModel from "../../DB/models/enrollment.model.js";
// import {
//   clearCacheByPrefix,
//   clearCache,
//   clearCourseCache,
// } from "../../utils/cache.js";
// import { coursesKey, courseKey } from "../../utils/cacheKeys.js";
// import redisClient from "../../config/redis.js";
// import LessonModel from "../../DB/models/lesson.model.js";
// import { getIO } from "../../../socket.js";
// import CourseAccess from "../../DB/models/courseAccess.model.js";
// import QuizAttemptModel from "../../DB/models/quizAttempt.model.js";
// import CommentModel from "../../DB/models/comment.model.js";
// import QuizModel from "../../DB/models/quiz.model.js";
// // ================= CREATE COURSE =================
// export const createCourse = async (data, instructorId) => {
//   const { title, instructorPhone } = data;

//   // 🔥 validation
//   if (!title) {
//     throw new Error("Course title is required");
//   }

//   const exist = await CourseModel.findOne({
//     title,
//     instructor: instructorId,
//   });

//   if (exist) {
//     throw new Error(
//       "Course with this title already exists for this instructor",
//     );
//   }

//   const course = await CourseModel.create({
//     ...data,
//     instructor: instructorId,
//     instructorPhone: instructorPhone || "",
//   });

//   // 🔥 CACHE INVALIDATION (important fix)
//   await clearCacheByPrefix("courses:");

//   return {
//     _id: course._id,
//     title: course.title,
//     description: course.description,
//     price: course.price,
//     instructor: course.instructor,
//     createdAt: course.createdAt,
//   };
// };
// // ================= GET COURSES =================
// // ================= GET COURSES =================
// export const getCourses = async (userId, page = 1, limit = 20) => {
//   const key = coursesKey(page, limit);

//   const cached = await redisClient.get(key);

//   let courses;

//   // ================= CACHE =================
//   if (cached) {
//     courses = JSON.parse(cached);
//   } else {
//     courses = await CourseModel.find()
//       .populate("instructor", "name email")
//       .select(
//         "title description instructor price isPublished thumbnail instructorPhone",
//       )
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     await redisClient.setEx(key, 3600, JSON.stringify(courses));
//   }

//   // ================= NO USER =================
//   if (!userId) {
//     return courses.map((course) => ({
//       ...course,
//       hasAccess: course.price === 0,
//       enrollment: null,
//     }));
//   }

//   // ================= ENROLLMENTS =================
//   const enrollments = await EnrollmentModel.find({
//     student: userId,
//   })
//     .select("course approvalStatus")
//     .lean();

//   const enrollmentMap = new Map();

//   for (const e of enrollments) {
//     enrollmentMap.set(String(e.course), e);
//   }

//   // ================= MERGE =================
//   return courses.map((course) => {
//     const enrollment = enrollmentMap.get(String(course._id));

//     return {
//       ...course,
//       enrollment: enrollment || null,
//       enrollmentId: enrollment?._id || null,
//       hasAccess:
//         enrollment?.approvalStatus === "accepted" || course.price === 0,
//     };
//   });
// };

// // ================= GET COURSE =================
// export const getCourseById = async (courseId, userId = null) => {
//   try {
//     if (!courseId) return null;

//     // ================= CACHE =================
//     const cacheKey = `course:${courseId}:static`;

//     let course = await redisClient.get(cacheKey);

//     if (course) {
//       course = JSON.parse(course);
//     } else {
//       const dbCourse = await CourseModel.findById(courseId)
//         .populate("instructor", "name email")
//         .lean();

//       if (!dbCourse) return null;

//       const lessons = await LessonModel.find({ course: courseId }).lean();

//       course = {
//         ...dbCourse,
//         lessons,
//       };

//       await redisClient.setEx(cacheKey, 3600, JSON.stringify(course));
//     }

//     // ================= NO USER =================
//     if (!userId) {
//       return {
//         ...course,
//         enrollment: null,
//         hasAccess: course.price === 0,
//       };
//     }

//     // ================= USER STATE (ALWAYS DB) =================
//     const enrollment = await EnrollmentModel.findOne({
//       course: courseId,
//       student: userId,
//     }).lean();

//     const hasAccess =
//       course.price === 0 ||
//       enrollment?.payment?.status === "completed" ||
//       enrollment?.approvalStatus === "accepted";

//     return {
//       ...course,
//       enrollment: enrollment || null,
//       enrollmentId: enrollment?._id || null,
//       hasAccess,
//     };
//   } catch (err) {
//     console.error("getCourseById error:", err);
//     return null;
//   }
// };
// // ================= UPDATE COURSE =================
// export const updateCourse = async (courseId, instructorId, data) => {
//   if (!data || Object.keys(data).length === 0) {
//     throw new Error("No data provided for update");
//   }

//   const updated = await CourseModel.findOneAndUpdate(
//     {
//       _id: courseId,
//       instructor: instructorId,
//     },
//     data,
//     {
//       new: true,
//     },
//   );

//   if (!updated) return null;

//   // ================= CACHE INVALIDATION =================
//   await clearCacheByPrefix("courses:");
//   await clearCache(courseKey(courseId));
//   const io = getIO();
//   io.emit("course:updated", { courseId });
//   return {
//     _id: updated._id,
//     title: updated.title,
//     description: updated.description,
//     price: updated.price,
//     thumbnail: updated.thumbnail,
//     isPublished: updated.isPublished,
//     updatedAt: updated.updatedAt,
//   };
// };

// // ================= DELETE COURSE =================
// export const deleteCourse = async (courseId, instructorId) => {
//   if (!courseId || !instructorId) {
//     throw new Error("Invalid course or instructor id");
//   }

//   // 🔥 1. delete course with ownership check
//   const deleted = await CourseModel.findOneAndDelete({
//     _id: courseId,
//     instructor: instructorId,
//   });

//   if (!deleted) return null;

//   // ================== LESSONS ==================
//   const lessons = await LessonModel.find({ course: courseId }).select("_id");

//   const lessonIds = lessons.map((l) => l._id);

//   // ================== QUIZZES ==================
//   const quizzes = await QuizModel.find({ course: courseId }).select("_id");
//   const quizIds = quizzes.map((q) => q._id);

//   // ================== COMMENTS ==================
//   await CommentModel.deleteMany({
//     lesson: { $in: lessonIds },
//   });

//   // ================== QUIZ ATTEMPTS ==================
//   await QuizAttemptModel.deleteMany({
//     quiz: { $in: quizIds },
//   });

//   // ================== QUIZZES ==================
//   await QuizModel.deleteMany({
//     course: courseId,
//   });

//   // ================== LESSONS ==================
//   await LessonModel.deleteMany({
//     course: courseId,
//   });

//   // ================== ENROLLMENTS ==================
//   await EnrollmentModel.deleteMany({
//     course: courseId,
//   });

//   // ================== COURSE ACCESS ==================
//   await CourseAccess.deleteMany({
//     course: courseId,
//   });

//   // ✅ كسر كل الكاش المرتبط بالكورس
//   await clearCourseCache(courseId);

//   // ✅ ابعت socket event
//   const io = getIO();
//   io.emit("course:deleted", { courseId });

//   return {
//     _id: deleted._id,
//     title: deleted.title,
//     message: "Course deleted successfully",
//   };
// };








import CourseModel from "../../DB/models/course.model.js";
import EnrollmentModel from "../../DB/models/enrollment.model.js";
import {
  clearCacheByPrefix,
  clearCache,
  clearCourseCache,
} from "../../utils/cache.js";
import { coursesKey, courseKey } from "../../utils/cacheKeys.js";
import redis from "../../config/redis.js";
import LessonModel from "../../DB/models/lesson.model.js";
import { getIO } from "../../../socket.js";
import CourseAccess from "../../DB/models/courseAccess.model.js";
import QuizAttemptModel from "../../DB/models/quizAttempt.model.js";
import CommentModel from "../../DB/models/comment.model.js";
import QuizModel from "../../DB/models/quiz.model.js";

// ================= CREATE COURSE =================
export const createCourse = async (data, instructorId) => {
  const { title, instructorPhone } = data;

  if (!title) {
    throw new Error("Course title is required");
  }

  const exist = await CourseModel.findOne({
    title,
    instructor: instructorId,
  });

  if (exist) {
    throw new Error(
      "Course with this title already exists for this instructor",
    );
  }

  const course = await CourseModel.create({
    ...data,
    instructor: instructorId,
    instructorPhone: instructorPhone || "",
  });

  await clearCacheByPrefix("courses:");

  return {
    _id: course._id,
    title: course.title,
    description: course.description,
    price: course.price,
    instructor: course.instructor,
    createdAt: course.createdAt,
  };
};

// ================= GET COURSES =================
export const getCourses = async (userId, page = 1, limit = 20) => {
  const key = coursesKey(page, limit);

  const cached = await redis.get(key);

  let courses;

  if (cached) {
    courses = typeof cached === "string" ? JSON.parse(cached) : cached;
  } else {
    courses = await CourseModel.find()
      .populate("instructor", "name email")
      .select(
        "title description instructor price isPublished thumbnail instructorPhone",
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await redis.set(key, JSON.stringify(courses), { ex: 3600 });
  }

  if (!userId) {
    return courses.map((course) => ({
      ...course,
      hasAccess: course.price === 0,
      enrollment: null,
    }));
  }

  const enrollments = await EnrollmentModel.find({
    student: userId,
  })
    .select("course approvalStatus")
    .lean();

  const enrollmentMap = new Map();

  for (const e of enrollments) {
    enrollmentMap.set(String(e.course), e);
  }

  return courses.map((course) => {
    const enrollment = enrollmentMap.get(String(course._id));

    return {
      ...course,
      enrollment: enrollment || null,
      enrollmentId: enrollment?._id || null,
      hasAccess:
        enrollment?.approvalStatus === "accepted" || course.price === 0,
    };
  });
};

// ================= GET COURSE =================
export const getCourseById = async (courseId, userId = null) => {
  try {
    if (!courseId) return null;

    const cacheKey = `course:${courseId}:static`;

    let course = await redis.get(cacheKey);

    if (course) {
      course = typeof course === "string" ? JSON.parse(course) : course;
    } else {
      const dbCourse = await CourseModel.findById(courseId)
        .populate("instructor", "name email")
        .lean();

      if (!dbCourse) return null;

      const lessons = await LessonModel.find({ course: courseId }).lean();

      course = {
        ...dbCourse,
        lessons,
      };

      await redis.set(cacheKey, JSON.stringify(course), { ex: 3600 });
    }

    if (!userId) {
      return {
        ...course,
        enrollment: null,
        hasAccess: course.price === 0,
      };
    }

    const enrollment = await EnrollmentModel.findOne({
      course: courseId,
      student: userId,
    }).lean();

    const hasAccess =
      course.price === 0 ||
      enrollment?.payment?.status === "completed" ||
      enrollment?.approvalStatus === "accepted";

    return {
      ...course,
      enrollment: enrollment || null,
      enrollmentId: enrollment?._id || null,
      hasAccess,
    };
  } catch (err) {
    console.error("getCourseById error:", err);
    return null;
  }
};

// ================= UPDATE COURSE =================
export const updateCourse = async (courseId, instructorId, data) => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error("No data provided for update");
  }

  const updated = await CourseModel.findOneAndUpdate(
    {
      _id: courseId,
      instructor: instructorId,
    },
    data,
    {
      new: true,
    },
  );

  if (!updated) return null;

  await clearCacheByPrefix("courses:");
  await clearCache(courseKey(courseId));

  const io = getIO();
  io.emit("course:updated", { courseId });

  return {
    _id: updated._id,
    title: updated.title,
    description: updated.description,
    price: updated.price,
    thumbnail: updated.thumbnail,
    isPublished: updated.isPublished,
    updatedAt: updated.updatedAt,
  };
};

// ================= DELETE COURSE =================
export const deleteCourse = async (courseId, instructorId) => {
  if (!courseId || !instructorId) {
    throw new Error("Invalid course or instructor id");
  }

  const deleted = await CourseModel.findOneAndDelete({
    _id: courseId,
    instructor: instructorId,
  });

  if (!deleted) return null;

  const lessons = await LessonModel.find({ course: courseId }).select("_id");
  const lessonIds = lessons.map((l) => l._id);

  const quizzes = await QuizModel.find({ course: courseId }).select("_id");
  const quizIds = quizzes.map((q) => q._id);

  await CommentModel.deleteMany({
    lesson: { $in: lessonIds },
  });

  await QuizAttemptModel.deleteMany({
    quiz: { $in: quizIds },
  });

  await QuizModel.deleteMany({
    course: courseId,
  });

  await LessonModel.deleteMany({
    course: courseId,
  });

  await EnrollmentModel.deleteMany({
    course: courseId,
  });

  await CourseAccess.deleteMany({
    course: courseId,
  });

  await clearCourseCache(courseId);

  const io = getIO();
  io.emit("course:deleted", { courseId });

  return {
    _id: deleted._id,
    title: deleted.title,
    message: "Course deleted successfully",
  };
};









