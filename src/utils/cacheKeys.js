// // src/utils/cacheKeys.js

// // كورسات
// export const coursesKey = (page = 1, limit = 20) => `courses:page=${page}:limit=${limit}`;
// export const courseKey = (courseId) => `course:${courseId}`;
// export const myCoursesKey = (studentId) => `myCourses:${studentId}`;
// // دروس
// export const lessonsKey = (courseId, page = 1, limit = 20) => `lessons:course=${courseId}:page=${page}:limit=${limit}`;
// export const lessonKey = (lessonId) => `lesson:${lessonId}`;

// // كويزات
// export const courseQuizzesKey = (courseId, page = 1, limit = 20) => `quizzes:course=${courseId}:page=${page}:limit=${limit}`;
// export const quizKey = (quizId) => `quiz:${quizId}`;

// // نتائج الكويز
// export const quizResultsKey = (quizId) => `quizResults:${quizId}`;

// ================= PREFIXES =================
export const COURSES_PREFIX = "courses:";
export const COURSE_PREFIX = "course:";
export const LESSONS_PREFIX = "lessons:course=";
export const LESSON_PREFIX = "lesson:";
export const QUIZZES_PREFIX = "quizzes:course=";
export const QUIZ_PREFIX = "quiz:";

// ================= KEYS =================
export const coursesKey = (page = 1, limit = 20) =>
  `courses:page=${page}:limit=${limit}`;

export const courseKey = (courseId) =>
  `course:${courseId}`;

export const myCoursesKey = (studentId) =>
  `myCourses:${studentId}`;

export const lessonsKey = (courseId, page = 1, limit = 20) =>
  `lessons:course=${courseId}:page=${page}:limit=${limit}`;

export const lessonKey = (lessonId) =>
  `lesson:${lessonId}`;

export const courseQuizzesKey = (courseId, page = 1, limit = 20) =>
  `quizzes:course=${courseId}:page=${page}:limit=${limit}`;

export const quizKey = (quizId) =>
  `quiz:${quizId}`;

export const quizResultsKey = (quizId) =>
  `quizResults:${quizId}`;