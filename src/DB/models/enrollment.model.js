import mongoose, { Schema, model } from "mongoose";

const enrollmentSchema = new Schema(
  {
    student: {
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

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    // 💰 Payment Info
    payment: {
      method: {
        type: String,
        enum: ["instapay"],
        default: "instapay",
      },

      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
        index: true,
      },

      transactionId: {
        type: String,
        default: "",
      },

      amount: {
        type: Number,
        default: 0,
      },

      paidAt: {
        type: Date,
        default: null,
      },
    },

    // 🔥 بيانات إضافية
    senderNumber: {
      type: String,
      default: null,
    },

    receipt: {
      type: String,
      default: null,
    },

    // 🔹 حالة القبول
    approvalStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================== INDEX ================== */
// يمنع اشتراك الطالب في نفس الكورس مرتين
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

/* ================== MODEL ================== */
const EnrollmentModel =
  mongoose.models.Enrollment ||
  model("Enrollment", enrollmentSchema);

export default EnrollmentModel;