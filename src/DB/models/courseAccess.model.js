import mongoose, { Schema, model } from "mongoose";

const courseAccessSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    paid: {
      type: Boolean,
      default: false,
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/* ================== منع التكرار ================== */
courseAccessSchema.index(
  { user: 1, course: 1 },
  { unique: true }
);

/* ================== MODEL ================== */
const CourseAccess =
  mongoose.models.CourseAccess ||
  model("CourseAccess", courseAccessSchema);

export default CourseAccess;