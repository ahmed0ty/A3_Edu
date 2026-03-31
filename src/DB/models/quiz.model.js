import mongoose, { Schema, model } from "mongoose";

/* ================== QUESTION ================== */
const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "fill-blank", "essay"],
      required: true,
    },

    image: {
      type: String,
      default: null,
    },

    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: Schema.Types.Mixed,
      required: function () {
        return this.type !== "essay";
      },
    },

    points: {
      type: Number,
      default: 1,
      min: 0,
    },
  }
  // ✅ شيلنا _id: false عشان كل سؤال يبقى ليه _id
);

/* ================== QUIZ ================== */
const quizSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: null,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    questions: {
      type: [questionSchema],
      default: [],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Quiz must have at least one question",
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================== INDEX ================== */
quizSchema.index({ course: 1, startAt: 1 });
quizSchema.index({ endAt: 1 });

/* ================== MODEL ================== */
const QuizModel =
  mongoose.models.Quiz || model("Quiz", quizSchema);

export default QuizModel;