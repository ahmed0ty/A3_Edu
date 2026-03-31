import CommentModel from "../../DB/models/comment.model.js";
import LessonModel from "../../DB/models/lesson.model.js";
import { clearCache } from "../../utils/cache.js";
import { lessonsKey, lessonKey, coursesKey } from "../../utils/cacheKeys.js";
import redisClient from "../../config/redis.js";

// ================= CREATE LESSON =================
export const createLesson = async (data, courseId) => {
  if (!data.instructor) {
    throw new Error("Instructor is required");
  }

  const lesson = await LessonModel.create({
    ...data,
    course: courseId,
  });

  await clearCache([lessonsKey(courseId, 1, 20), coursesKey()]);

  return lesson;
};

// ================= UPDATE LESSON =================
export const updateLesson = async (lessonId, data) => {
  const updated = await LessonModel.findByIdAndUpdate(lessonId, data, {
    new: true,
  });

  if (updated) {
    await clearCache([
      lessonKey(lessonId),
      lessonsKey(updated.course, 1, 20),
      coursesKey(),
    ]);
  }

  return updated;
};

// ================= DELETE LESSON =================
export const deleteLesson = async (lessonId) => {
  await CommentModel.deleteMany({ lesson: lessonId });

  const lesson = await LessonModel.findByIdAndDelete(lessonId);

  if (lesson) {
    await clearCache([
      lessonKey(lessonId),
      lessonsKey(lesson.course, 1, 20),
      coursesKey(),
    ]);
  }

  return lesson;
};

// ================= COMPLETE LESSON =================
export const completeLesson = async (lessonId, userId) => {
  // ✅ push اليوزر في array الـ completedBy
  const lesson = await LessonModel.findByIdAndUpdate(
    lessonId,
    { $addToSet: { completedBy: userId } },
    { new: true },
  );

  if (lesson) {
    await clearCache([lessonKey(lessonId), lessonsKey(lesson.course, 1, 20)]);
  }

  return lesson;
};
// ================= GET LESSONS =================
export const getLessons = async (
  courseId,
  page = 1,
  limit = 20,
  userId = null,
) => {
  const lessons = await LessonModel.find({ course: courseId })
    .select("title type content course completedBy")
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // ✅ كل يوزر يشوف الـ completed بتاعه بس
  return lessons.map((lesson) => ({
    ...lesson,
    completed: userId
      ? lesson.completedBy?.some((id) => String(id) === String(userId))
      : false,
    completedBy: undefined, // ✅ مش بنبعت للفرونت
  }));
};
// ================= GET SINGLE LESSON =================
export const getLessonById = async (lessonId) => {
  const key = lessonKey(lessonId);

  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached);

  const lesson = await LessonModel.findById(lessonId)
    .populate("course", "title")
    .lean();

  if (lesson) {
    await redisClient.setEx(key, 3600, JSON.stringify(lesson));
  }

  return lesson;
};
