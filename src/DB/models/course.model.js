import mongoose, { Schema, model } from "mongoose";
import LessonModel from "./lesson.model.js";
import QuizModel from "./quiz.model.js";
import QuizAttemptModel from "./quizAttempt.model.js";
import CommentModel from "./comment.model.js";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    instructorName: {
      type: String,
      required: true,
      default: "Unknown",
    },

    instructorPhone: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index
courseSchema.index({ title: "text" });

/* ================== CASCADE DELETE ================== */
courseSchema.pre("findOneAndDelete", async function () {
  try {
    const course = await this.model.findOne(this.getFilter());

    if (!course) return;

    const courseId = course._id;

    // lessons
    const lessons = await LessonModel.find({ course: courseId }).select("_id");
    const lessonIds = lessons.map((l) => l._id);

    // quizzes
    const quizzes = await QuizModel.find({ course: courseId }).select("_id");
    const quizIds = quizzes.map((q) => q._id);

    // comments
    await CommentModel.deleteMany({
      lesson: { $in: lessonIds },
    });

    // quiz attempts
    await QuizAttemptModel.deleteMany({
      quiz: { $in: quizIds },
    });

    // quizzes
    await QuizModel.deleteMany({ course: courseId });

    // lessons
    await LessonModel.deleteMany({ course: courseId });

  } catch (err) {
    console.error("❌ CASCADE DELETE ERROR:", err);
  }
});

/* ================== MODEL ================== */
const CourseModel =
  mongoose.models.Course || model("Course", courseSchema);

export default CourseModel;