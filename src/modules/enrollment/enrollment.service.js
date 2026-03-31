// src/modules/enrollment/enrollment.service.js

import EnrollmentModel from "../../DB/models/enrollment.model.js";
import LessonModel from "../../DB/models/lesson.model.js";
import { clearCache, clearCourseCache } from "../../utils/cache.js";
import { myCoursesKey } from "../../utils/cacheKeys.js";

// ================= ENROLL STUDENT =================
export const enrollCourse = async (
  studentId,
  courseId,
  payment = { amount: 0 }
) => {
  const exist = await EnrollmentModel.findOne({
    student: studentId,
    course: courseId,
  });

  if (exist) throw new Error("Student already enrolled");

  const enrollment = await EnrollmentModel.create({
    student: studentId,
    course: courseId,
    payment: {
      method: "instapay",
      amount: payment.amount || 0,
      status: "pending",
      paidAt: null,
    },
  });

  // 🗑️ clear cache
  await clearCache(myCoursesKey(studentId));
await clearCourseCache(); // ✅ عشان الداشبورد يتحدث

  return enrollment;
};

// ================= GET STUDENT COURSES =================
export const getStudentCourses = async (studentId) => {
  const enrollments = await EnrollmentModel.find({
    student: studentId,
  })
    .populate(
      "course",
      "title description price thumbnail duration rating"
    )
    .lean();

  const coursesWithEnrollment = enrollments.map((enroll) => ({
    ...enroll.course,
    enrollment: {
      _id: enroll._id,
      payment: enroll.payment,
      progress: enroll.progress || 0,
      completedLessons: enroll.completedLessons || [],
    },
  }));

  return coursesWithEnrollment;
};

// ================= UPDATE PROGRESS =================
export const updateProgress = async (
  enrollmentId,
  completedLessonId
) => {
  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) throw new Error("Enrollment not found");

  if (!enrollment.completedLessons) {
    enrollment.completedLessons = [];
  }

  if (!enrollment.completedLessons.includes(completedLessonId)) {
    enrollment.completedLessons.push(completedLessonId);
  }

  const totalLessons = await LessonModel.countDocuments({
    course: enrollment.course,
  });

  enrollment.progress =
    totalLessons === 0
      ? 0
      : Math.round(
          (enrollment.completedLessons.length / totalLessons) * 100
        );

  await enrollment.save();

  await clearCache(myCoursesKey(enrollment.student.toString()));
  await clearCourseCache();

  return enrollment;
};

// ================= UPDATE PAYMENT STATUS =================
export const updatePaymentStatus = async (
  enrollmentId,
  paymentUpdate
) => {
  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) throw new Error("Enrollment not found");

  enrollment.payment = {
    ...enrollment.payment,
    ...paymentUpdate,
    method: "instapay",
    status: paymentUpdate.status || enrollment.payment.status,
    paidAt: paymentUpdate.paidAt || new Date(),
  };

  if (paymentUpdate.senderNumber) {
    enrollment.senderNumber = paymentUpdate.senderNumber;
  }

  if (paymentUpdate.receipt) {
    enrollment.receipt = paymentUpdate.receipt;
  }

  await enrollment.save();

  await clearCache(myCoursesKey(enrollment.student.toString()));
  await clearCourseCache();

  return enrollment;
};

// ================= TEACHER: GET STUDENTS IN COURSE =================
export const getCourseEnrollments = async (courseId) => {
  const enrollments = await EnrollmentModel.find({
    course: courseId,
  })
    .populate("student", "name email")
    .lean();

  return enrollments.map((enroll) => ({
    student: enroll.student,
    payment: enroll.payment,
    progress: enroll.progress || 0,
    completedLessons: enroll.completedLessons || [],
  }));
};

// ================= TEACHER: GRANT ACCESS =================
export const grantAccess = async (enrollmentId) => {
  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) throw new Error("Enrollment not found");

  enrollment.payment.status = "completed";
  enrollment.payment.paidAt = new Date();

  await enrollment.save();

  await clearCache(myCoursesKey(enrollment.student.toString()));
  await clearCourseCache();

  return enrollment;
};