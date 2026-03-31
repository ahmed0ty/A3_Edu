// src/modules/quiz/quiz.service.js

import QuizModel from "../../DB/models/quiz.model.js";
import QuizAttemptModel from "../../DB/models/quizAttempt.model.js";
import redisClient from "../../config/redis.js";
import { clearCache } from "../../utils/cache.js";
import {
  courseQuizzesKey,
  quizKey,
  quizResultsKey,
} from "../../utils/cacheKeys.js";
import mongoose from "mongoose";
import { clearCacheByPrefix } from "../../utils/cache.js";
// =======================
// 🔹 Instructor - Create Quiz
// =======================
export const createQuiz = async (data, instructorId) => {
  const quiz = await QuizModel.create({
    ...data,
    createdBy: instructorId,
    startAt: data.startAt,
    endAt: data.endAt,
  });

  await clearCacheByPrefix(`quizzes:course=${quiz.course}`);
  return quiz;
};

// =======================
// 🔹 Instructor - Update Quiz
// =======================
export const updateQuiz = async (quizId, instructorId, data) => {
  if (data.startAt) data.startAt = new Date(data.startAt);
  if (data.endAt) data.endAt = new Date(data.endAt);

  const updated = await QuizModel.findOneAndUpdate(
    { _id: quizId, createdBy: instructorId },
    data,
    { new: true },
  );

  if (!updated) return null;

  await clearCacheByPrefix(`quizzes:course=${updated.course}`);
  await clearCache([quizKey(quizId), quizResultsKey(quizId)]);

  return updated;
};

// =======================
// 🔹 Instructor - Delete Quiz
// =======================
export const deleteQuiz = async (quizId, instructorId) => {
  const quiz = await QuizModel.findById(quizId);

  if (!quiz) throw new Error("Quiz not found");

  if (quiz.createdBy.toString() !== instructorId.toString()) {
    throw new Error("Not authorized");
  }

  await QuizAttemptModel.deleteMany({ quiz: quizId });

  const deleted = await QuizModel.findByIdAndDelete(quizId);

  await clearCacheByPrefix(`quizzes:course=${quiz.course}`);
  await clearCache([quizKey(quizId), quizResultsKey(quizId)]);

  return deleted;
};

// =======================
// 🔹 Student - Get Quizzes
// =======================
export const getQuizzesForCourse = async (
  courseId,
  studentId,
  page = 1,
  limit = 20,
) => {
  const now = new Date();
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const quizzes = await QuizModel.find({ course: courseId })
    .select("-questions.correctAnswer")
    .lean();

  const quizIds = quizzes.map((q) => q._id);

  const attempts = await QuizAttemptModel.find({
    student: studentObjectId,
    quiz: { $in: quizIds },
  }).lean();

  const formatted = quizzes.map((q) => {
    const start = new Date(q.startAt);
    const end = new Date(q.endAt);

    let status = "upcoming";
    if (now >= start && now <= end) status = "open";
    else if (now > end) status = "closed";

    const attempt = attempts.find(
      (a) => a.quiz.toString() === q._id.toString(),
    );

    return {
      _id: q._id,
      title: q.title,
      course: q.course,
      startAt: q.startAt,
      endAt: q.endAt,
      status,
      attemptId: attempt?._id || null,
      completed: !!attempt?.completedAt,
    };
  });

  return formatted;
};

// =======================
// 🔹 Student - Start Quiz
// =======================
export const startQuiz = async (quizId, studentId) => {
  const quiz = await QuizModel.findById(quizId);

  if (!quiz) throw new Error("Quiz not found");

  const now = new Date();

  if (quiz.startAt && now < quiz.startAt) {
    throw new Error("Quiz not started yet");
  }

  if (quiz.endAt && now > quiz.endAt) {
    throw new Error("Quiz already finished");
  }

  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  let attempt = await QuizAttemptModel.findOne({
    quiz: quizId,
    student: studentObjectId,
  });

  if (attempt) {
    if (attempt.completedAt) {
      return {
        attemptId: attempt._id,
        completed: true,
      };
    }

    if (now < attempt.expiresAt) {
      return {
        attemptId: attempt._id,
        completed: false,
      };
    }

    attempt.completedAt = now;
    await attempt.save();

    return {
      attemptId: attempt._id,
      completed: true,
    };
  }

  const expiresAt = new Date(now.getTime() + quiz.duration * 60 * 1000);

  attempt = await QuizAttemptModel.create({
    quiz: quizId,
    student: studentObjectId,
    startedAt: now,
    expiresAt,
  });

  return {
    attemptId: attempt._id,
    completed: false,
  };
};

// =======================
// 🔹 Student - Get Attempt
// =======================
export const getAttempt = async (attemptId, studentId) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new Error("Invalid attempt id");
  }

  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const attempt = await QuizAttemptModel.findOne({
    _id: attemptId,
    student: studentObjectId,
  }).populate({
    path: "quiz",
    select: "title questions course", // ✅
  });

  if (!attempt) throw new Error("Attempt not found");

  return {
    completed: !!attempt.completedAt,
    data: attempt,
  };
};

// =======================
// 🔹 Student - Submit Quiz
// =======================
export const submitQuiz = async (attemptId, studentId, answers) => {
  if (!Array.isArray(answers) || !answers.length) {
    throw new Error("Invalid answers");
  }

  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const attempt = await QuizAttemptModel.findOne({
    _id: attemptId,
    student: studentObjectId,
  }).populate("quiz", "title questions course"); // ✅

  if (!attempt) throw new Error("Attempt not found");

  if (attempt.completedAt) {
    throw new Error("Quiz already submitted");
  }

  if (new Date() > attempt.expiresAt) {
    throw new Error("Time expired");
  }

  let score = 0;
  const storedAnswers = [];

  attempt.quiz.questions.forEach((q) => {
    const userAnswer = answers.find((a) => a.questionId === q._id.toString());

    const normalize = (val) =>
      String(val || "")
        .trim()
        .toLowerCase();

    if (userAnswer) {
      const isCorrect =
        normalize(userAnswer.answer) === normalize(q.correctAnswer);

      if (isCorrect) score += q.points;

      storedAnswers.push({
        questionId: q._id,
        answer: userAnswer.answer,
      });
    }
  });

  attempt.answers = storedAnswers;
  attempt.score = score;
  attempt.completedAt = new Date();

  await attempt.save();

  await clearCacheByPrefix(`quizzes:course=${attempt.quiz.course}`);

  return {
    attemptId: attempt._id,
    score: attempt.score,
  };
};

// =======================
// 🔹 Student - Get Result
// =======================
export const getMyResult = async (quizId, studentId) => {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const attempt = await QuizAttemptModel.findOne({
    quiz: quizId,
    student: studentObjectId,
  }).populate({
    path: "quiz",
    select: "title questions course", // ✅
  });

  if (!attempt) {
    throw new Error("No attempt found");
  }

  return {
    quiz: {
      _id: attempt.quiz._id,
      title: attempt.quiz.title,
      questions: attempt.quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        points: q.points,
      })),
    },
    answers: attempt.answers,
    score: attempt.score,
    completedAt: attempt.completedAt,
  };
};
