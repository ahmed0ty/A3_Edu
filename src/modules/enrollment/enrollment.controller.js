// src/modules/enrollment/enrollment.controller.js

import * as enrollmentService from "./enrollment.service.js";
import { cache } from "../../middlewares/cach.middleware.js";
import { myCoursesKey } from "../../utils/cacheKeys.js";
import EnrollmentModel from "../../DB/models/enrollment.model.js";
import mongoose from "mongoose";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { generateSignature } from "../../utils/fawry.js";
import Course from "../../DB/models/course.model.js";
import { getIO } from "../../../socket.js";
import { clearCourseCache } from "../../utils/cache.js";
// ================= ENROLL COURSE =================
export const enrollCourse = async (req, res, next) => {
  try {
    const { courseId, amount } = req.body;

    if (!courseId) throw new Error("CourseId is required");

    const enrollment = await enrollmentService.enrollCourse(
      req.user._id,
      courseId,
      { method: "instapay", amount: amount || 0 }
    );

    res.status(201).json({
      message: "Enrolled successfully",
      data: enrollment
    });

  } catch (error) {
    next(error);
  }
};

// ================= GET MY COURSES =================
export const getMyCourses = [
  async (req, res, next) => {
    try {
      await cache(() => myCoursesKey(req.user._id))(
        req,
        res,
        async () => {
          const courses =
            await enrollmentService.getStudentCourses(req.user._id);

          res.status(200).json({ data: courses });
        }
      );
    } catch (error) {
      next(error);
    }
  }
];

// ================= UPDATE PROGRESS =================
export const updateProgress = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.updateProgress(
      req.params.id,
      req.body.completedLessonId
    );

    res.status(200).json({
      message: "Progress updated",
      data: enrollment
    });

  } catch (error) {
    next(error);
  }
};

// ================= UPDATE PAYMENT STATUS =================
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { enrollmentId, status, transactionId, paidAt } = req.body;

    const updatedEnrollment =
      await enrollmentService.updatePaymentStatus(enrollmentId, {
        status,
        transactionId,
        paidAt: paidAt ? new Date(paidAt) : new Date()
      });

    res.status(200).json({
      message: "Payment status updated",
      data: updatedEnrollment
    });

  } catch (error) {
    next(error);
  }
};

// ================= CREATE PAYMENT SESSION =================
export const createPaymentSession = async (req, res, next) => {
  try {
    const { enrollmentId } = req.body;

    if (!enrollmentId) throw new Error("Missing enrollmentId");

    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    const paymentUrl =
      `https://ipn.eg/S/chillout.egypt/instapay/${enrollmentId}`;

    res.status(200).json({ paymentUrl });

  } catch (err) {
    next(err);
  }
};

// ================= GET PAYMENT STATUS =================
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    res.status(200).json({
      status: enrollment.payment.status
    });

  } catch (err) {
    next(err);
  }
};

// ================= GET ENROLLMENTS FOR INSTRUCTOR =================
export const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollments = await EnrollmentModel.find({ course: courseId })
      .populate("student", "name email")
      .lean();

    res.status(200).json({ data: enrollments });

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE ENROLLMENT STATUS =================
export const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const enrollment = await EnrollmentModel.findById(enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    enrollment.approvalStatus = status;

    if (status === "accepted") {
      enrollment.payment.status = "completed";
      enrollment.payment.paidAt = new Date();
    }

    await enrollment.save();
    const io = getIO();
io.to(`user_${enrollment.student}`).emit("enrollmentUpdated", {
  courseId: enrollment.course,
  status,
});

// ✅ كسر الكاش
await clearCourseCache(enrollment.course.toString());

    res.status(200).json({
      message: `Enrollment ${status}`,
      data: enrollment
    });

  } catch (err) {
    next(err);
  }
};

// ================= CONFIRM PAYMENT =================
export const confirmPayment = async (req, res, next) => {
  try {
    const { courseId, senderNumber } = req.body;
    const receipt = req.file;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!courseId || !senderNumber || !receipt) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId",
      });
    }

    const studentId = req.user._id;

    let enrollment = await EnrollmentModel.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      enrollment = await EnrollmentModel.create({
        student: studentId,
        course: courseId,
        approvalStatus: "pending",
        payment: {
          status: "pending",
        },
      });
    }

    enrollment.senderNumber = senderNumber;
    enrollment.receipt = receipt.path;

    enrollment.payment.status = "completed";
    enrollment.payment.transactionId = senderNumber;
    enrollment.payment.paidAt = new Date();

    await enrollment.save();

    res.status(200).json({
      message: "Payment confirmed successfully",
      data: enrollment,
    });

  } catch (err) {
    next(err);
  }
};

// ================= MOCK PAYMENT =================
// export const payWithFawry = async (req, res, next) => {
//   try {
//     const { courseId } = req.body;

//     const course = await Course.findById(courseId);
//     if (!course) throw new Error("Course not found");

//     let enrollment = await EnrollmentModel.findOne({
//       student: req.user._id,
//       course: courseId,
//     });

//     if (!enrollment) {
//       enrollment = await EnrollmentModel.create({
//         student: req.user._id,
//         course: courseId,
//         approvalStatus: "pending",
//         payment: {
//           method: "instapay",
//           amount: course.price,
//           status: "pending",
//         },
//       });
//     }

//     const referenceNumber = "MOCK-" + Date.now();

//     console.log("💳 MOCK PAYMENT INITIATED");
//     console.log("Reference:", referenceNumber);

//     setTimeout(async () => {
//       const updated = await EnrollmentModel.findById(enrollment._id);

//       if (updated) {
//         updated.payment.status = "completed";
//         updated.payment.paidAt = new Date();
//         updated.approvalStatus = "accepted";

//         await updated.save();

//         console.log("✅ MOCK PAYMENT COMPLETED - COURSE UNLOCKED");
//       }
//     }, 3000);

//     res.json({
//       message: "Mock payment started",
//       referenceNumber,
//       status: "processing",
//     });

//   } catch (err) {
//     next(err);
//   }
// };

export const payWithFawry = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    let enrollment = await EnrollmentModel.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      enrollment = await EnrollmentModel.create({
        student: req.user._id,
        course: courseId,
        approvalStatus: "pending",
        payment: {
          method: "instapay",
          amount: course.price,
          status: "pending",
        },
      });
    }

    const referenceNumber = "MOCK-" + Date.now();

    // ✅ بدل setTimeout، اعمل complete فوراً وابعت socket
    enrollment.payment.status = "completed";
    enrollment.payment.paidAt = new Date();
    enrollment.approvalStatus = "accepted";
    await enrollment.save();

    // ✅ كسر الكاش
    await clearCourseCache();

    // ✅ ابعت للطالب إن الدفع اتكمل
    const io = getIO();
    io.to(`user_${req.user._id}`).emit("paymentCompleted", {
      courseId,
      enrollmentId: enrollment._id,
      status: "completed",
    });

    res.json({
      message: "Payment completed",
      referenceNumber,
      status: "completed",
    });

  } catch (err) {
    next(err);
  }
};