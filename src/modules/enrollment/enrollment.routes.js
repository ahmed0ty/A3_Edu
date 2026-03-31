// src/modules/enrollment/enrollment.routes.js
import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import * as enrollmentController from "./enrollment.controller.js";
import { uploadReceipt } from "../../middlewares/uploadReceipt.middleware.js";


const router = Router();

// ================= STUDENT ROUTES =================
router.post("/", protect, authorize("student"), enrollmentController.enrollCourse);
router.get("/my-courses", protect, authorize("student"), enrollmentController.getMyCourses);
router.put("/:id/progress", protect, authorize("student"), enrollmentController.updateProgress);
router.put("/:id/payment", protect, authorize("student"), enrollmentController.updatePaymentStatus);
router.post("/create-payment", protect, authorize("student"), enrollmentController.createPaymentSession);
router.get("/payment-status/:enrollmentId", protect, authorize("student"), enrollmentController.getPaymentStatus);
router.post(
  "/confirm-payment",
  protect,
  authorize("student"),
  uploadReceipt.single("receipt"),
  enrollmentController.confirmPayment
);

router.post(
  "/pay-with-fawry",
  protect,
  authorize("student"),
  enrollmentController.payWithFawry
);
// ================= INSTRUCTOR ROUTES =================
router.get(
  "/course/:courseId/enrollments",
  protect,
  authorize("instructor"),
  enrollmentController.getCourseEnrollments
);

// 🔹 تحديث حالة القبول / الرفض
router.put(
  "/:enrollmentId/status",
  protect,
  authorize("instructor"),
  enrollmentController.updateEnrollmentStatus
);

export default router;