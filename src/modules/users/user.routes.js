import { Router } from "express";
import * as userController from "./user.contoller.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { getUsersStats } from "./user.service.js";
import { upload } from "../../middlewares/upload.js";

const router = Router();


router.get(
  "/me",
  protect,
  userController.getMyProfile
);

router.put(
  "/me",
  protect,
  upload.single("profileImage"), // لو عندك multer
  userController.updateMyProfile
);


router.get("/stats", protect, authorize("admin"), userController.getUsersStats);



// 🔥 Instructor Requests
router.get(
  "/instructor/requests",
  protect,
  authorize("admin"),
  userController.getInstructorRequests
);

router.patch(
  "/instructor/approve/:id",
  protect,
  authorize("admin"),
  userController.approveInstructor
);

router.patch(
  "/instructor/reject/:id",
  protect,
  authorize("admin"),
  userController.rejectInstructor
);

router.patch(
  "/instructor/cancel-request",
  protect,
  userController.cancelInstructorRequest
);

// Admin only
router.get("/", protect, authorize("admin"), userController.getAllUsers);
router.get("/:id", protect, authorize("admin"), userController.getUser);
router.put("/:id", protect, authorize("admin"), userController.updateUser);
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);

router.patch(
  "/:id/toggle-active",
  protect,
  authorize("admin"),
  userController.toggleUserActive
);




export default router;