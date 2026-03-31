import mongoose, { Schema, model } from "mongoose";

/* ================== ANSWER ================== */
const answerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    answer: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

/* ================== QUIZ ATTEMPT ================== */
const quizAttemptSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ⏱️ التايمر
    startedAt: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================== INDEX ================== */

// 🔥 محاولة واحدة لكل طالب لكل كويز
quizAttemptSchema.index(
  { quiz: 1, student: 1 },
  { unique: true }
);

// ⚡ لتحسين البحث
quizAttemptSchema.index({ student: 1, createdAt: -1 });
quizAttemptSchema.index({ quiz: 1, score: -1 });

/* ================== MODEL ================== */
const QuizAttemptModel =
  mongoose.models.QuizAttempt ||
  model("QuizAttempt", quizAttemptSchema);

export default QuizAttemptModel;