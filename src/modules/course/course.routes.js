// // src/modules/course/course.routes.js
// import { Router } from "express";
// import { protect } from "../../middlewares/auth.middleware.js";
// import { authorize } from "../../middlewares/role.middleware.js";
// import * as courseController from "./course.controller.js";
// import { cache } from "../../middlewares/cach.middleware.js"; // ✅ استدعاء الكاش
// import {
//   createCourseValidation,
//   updateCourseValidation,
//   courseIdValidation
// } from "../../../validators/course.validator.js";
// // import { getLessonsByCourse } from "../lesson/lesson.service.js";
// import * as lessonController from "../lesson/lesson.controller.js";
// const router = Router();

// // CRUD routes
// router.post("/", protect, authorize("instructor"), createCourseValidation, courseController.createCourse);
// router.put("/:id", protect, authorize("instructor"), updateCourseValidation, courseController.updateCourse);
// router.delete("/:id", protect, authorize("instructor"), courseIdValidation, courseController.deleteCourse);

// // Read routes مع الكاش
// router.get("/", protect, cache(() => `courses:page=1:limit=20`), courseController.getCourses);

// router.get("/:id", protect, courseIdValidation, cache((req) => `course:${req.params.id}`), courseController.getCourse);
// router.patch("/:id/complete", protect, courseController.completeLesson);



// router.get("/course/:courseId", lessonController.getLessons);
// router.get("/:id/access", protect, courseController.checkAccess);
// export default router;


// src/modules/course/course.routes.js
import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import * as courseController from "./course.controller.js";
import { cache } from "../../middlewares/cach.middleware.js"; // ✅ استدعاء الكاش
import {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation
} from "../../../validators/course.validator.js";

const router = Router();

// ================== CRUD routes ==================
// Create course
router.post(
  "/",
  protect,
  authorize("instructor"),
  createCourseValidation,
  courseController.createCourse
);

// Update course
router.put(
  "/:id",
  protect,
  authorize("instructor"),
  updateCourseValidation,
  courseController.updateCourse
);

// Delete course
router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  courseIdValidation,
  courseController.deleteCourse
);

// ================== Read routes ==================
// Get all courses (paginated) مع cache
router.get(
  "/",
  protect,
  cache((req) => `courses:page=${req.query.page || 1}:limit=${req.query.limit || 20}`),
  courseController.getCourses
);

router.get(
  "/my-courses",
  protect,
  authorize("instructor"),
  courseController.getMyCourses
);

// Get single course مع cache
router.get(
  "/:id",
  protect,
  courseIdValidation,
  cache((req) => `course:${req.params.id}`),
  courseController.getCourse
);

// Check access for a user to a course
router.get("/:id/access", protect, courseController.checkAccess);

// ================== Complete lesson endpoint ==================
router.patch("/:id/complete", protect, courseController.completeLesson);

export default router;