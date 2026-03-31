// // src/modules/lessons/lesson.routes.js
// import { Router } from "express";
// import { protect } from "../../middlewares/auth.middleware.js";
// import { authorize } from "../../middlewares/role.middleware.js";
// import * as lessonController from "./lesson.controller.js";
// import { upload } from "../../middlewares/upload.js";
// import { cache } from "../../middlewares/cach.middleware.js"; // ✅ استدعاء الكاش
// import { lessonsKey } from "../../utils/cacheKeys.js";
// const router = Router();

// // 👨‍🏫 Instructor
// router.post(
//   "/course/:courseId",
//   protect,
//   authorize("instructor"),
//   upload.single("file"),
//   lessonController.createLesson
// );




// router.put("/:id", protect, authorize("instructor"), upload.single("file"), lessonController.updateLesson);
// router.delete("/:id", protect, authorize("instructor"), lessonController.deleteLesson);

// // 🎓 Read مع الكاش
// router.get(
//   "/course/:courseId",
//   protect,
//   cache((req) =>
//   lessonsKey(
//     req.params.courseId,
//     req.query.page || 1,
//     req.query.limit || 20
//   )
// ),
//   lessonController.getLessons
// );

// router.get(
//   "/:id",
//   protect,
//   cache((req) => `lesson:${req.params.id}`),
//   lessonController.getLesson
// );

// router.patch(
//   "/:id/complete",
//   protect,
//   lessonController.completeLesson
// );




// export default router;







// src/modules/lessons/lesson.routes.js
import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import * as lessonController from "./lesson.controller.js";
import { upload } from "../../middlewares/upload.js";
import { cache } from "../../middlewares/cach.middleware.js"; // ✅ استدعاء الكاش
import { lessonsKey } from "../../utils/cacheKeys.js";

const router = Router();

// ================== Instructor-only routes ==================
// Create lesson
router.post(
  "/course/:courseId",
  protect,
  authorize("instructor"),
  upload.single("file"),
  lessonController.createLesson
);

// Update lesson
router.put(
  "/:id",
  protect,
  authorize("instructor"),
  upload.single("file"),
  lessonController.updateLesson
);

// Delete lesson
router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  lessonController.deleteLesson
);

// ================== Read routes (students & instructors) ==================
// Get all lessons for a course (with cache)
router.get(
  "/course/:courseId",
  protect,
  cache((req) =>
    lessonsKey(
      req.params.courseId,
      req.query.page || 1,
      req.query.limit || 20
    )
  ),
  lessonController.getLessons
);

// Get single lesson (with cache)
router.get(
  "/:id",
  protect,
  cache((req) => `lesson:${req.params.id}`),
  lessonController.getLesson
);

// Complete lesson
router.patch(
  "/:id/complete",
  protect,
  lessonController.completeLesson
);

export default router;