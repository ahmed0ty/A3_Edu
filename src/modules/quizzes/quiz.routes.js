// src/modules/quizzes/quiz.routes.js
import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import * as quizController from "./quiz.controller.js";
import { cache } from "../../middlewares/cach.middleware.js"; // ✅ استدعاء الكاش
// import { getAttempt } from "./quiz.service.js";
import { courseQuizzesKey } from "../../utils/cacheKeys.js";
import { getQuizById } from "./quiz.controller.js";
import  upload  from "../../middlewares/uploadQuestionsImages.middleware.js";
import QuizAttemptModel from "../../DB/models/quizAttempt.model.js";

const router = Router();

router.get(
  "/instructor",
  protect,
  authorize("instructor"),
  quizController.getInstructorQuizzes
);
router.post("/attempt/:attemptId/submit", protect, authorize("student"), quizController.submitQuiz);

router.get(
  "/attempt/:attemptId",
  protect,
  authorize("student"),
  quizController.getAttempt
);


// 👨‍🏫 Instructor routes
router.post(
  "/",
  protect,
  authorize("instructor"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "questionImages", maxCount: 50 }, // 👈 مهم
  ]),
  quizController.createQuiz
);
router.put(
  "/:id",
  protect,
  authorize("instructor"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "questionImages", maxCount: 50 },
  ]),
  quizController.updateQuiz
);
router.delete("/:id", protect, authorize("instructor"), quizController.deleteQuiz);

// ✅ GET routes مع كاش
// بيان درجات لكويز محدد
// console.log("HANDLER =", quizController.getQuizzesForCourse);
router.get(
  "/:id/results",
  protect,
  authorize("instructor"),
  cache((req) => `quiz:${req.params.id}:results`),
  quizController.getQuizResults
);

// 🔹 بيان درجات لكل الكويزات في كورس معين
router.get(
  "/course/:courseId/results",
  protect,
  authorize("instructor"),
  cache((req) => `course:${req.params.courseId}:quizResults`),
  quizController.getCourseResults
);

// 🎓 Student routes
router.get(
  "/course/:courseId",
  protect,
  authorize("student", "instructor"),
  quizController.getQuizzesForCourse // ✅ من غير cache
);

// 🔥 Student: start quiz
router.post("/:id/start", protect, authorize("student"), quizController.startQuizController);

// 🔥 Student: submit quiz

router.get(
  "/:quizId/my-result",
  protect,
  authorize("student"),
  quizController.getMyResult
);


router.get("/:id", protect, quizController.getQuizById);



export default router;