import { Router } from "express";
import * as authController from "./auth.controller.js";
import { registerValidation, loginValidation } from "../../../validators/auth.validator.js";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { instructorUpload } from "../../middlewares/instructorUpload.js";
import { upload } from "../../middlewares/upload.js";
import UserModel from "../../DB/models/user.model.js";
const router = Router();

// ================= AUTH =================
router.post(
  "/register",
  upload.single("profileImage"), // Middleware لرفع الصورة
  registerValidation,            // Validation
  authController.register        // Controller
);
router.post("/login",authLimiter, loginValidation, authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

// ================= EMAIL =================
router.post("/confirm-email", authController.confirmEmail);

// ================= PASSWORD =================
router.post("/forgot-password",authLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.get("/me", protect, async (req, res) => {
  const user = await UserModel.findById(req.user._id);

  res.json({
    user: {
      ...user._doc,
      profileImage: user.profileImage,
    },
  });
});

router.post(
  "/request-instructor",
  protect,        // 👈 الأول
  instructorUpload.single("file"), // 👈 هنا
  authController.requestInstructor
);


export default router;