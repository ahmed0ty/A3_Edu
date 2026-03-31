import { Router } from "express";
import * as commentController from "./comment.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();

// 📝 إنشاء كومنت (طلاب ومدرسين مسجلين بالكورس)
router.post("/:lessonId", protect, commentController.createComment);

// 💬 رد المدرس على كومنت
router.patch(
  "/:commentId/reply",
  protect,
  authorize("instructor"), // بس المدرس يقدر يرد
  commentController.replyComment
);

// 👍/👎 عمل ريأكشن على الكومنت
router.patch("/:commentId/react", protect, commentController.reactComment);

router.patch("/:commentId", protect, commentController.updateComment);
router.delete("/:commentId", protect, commentController.deleteComment);
// 📄 جلب كل الكومنتات الخاصة بالدرس
router.get("/lesson/:lessonId", protect, commentController.getComments);

export default router;