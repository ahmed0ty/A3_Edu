import mongoose, { Schema, model } from "mongoose";

const reactionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      default: "like",
    },
  },
  { _id: false }
);

const commentSchema = new Schema(
  {
    // 📚 الدرس
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },

    // 👤 المستخدم
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 💬 المحتوى
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },

    // 👨‍🏫 رد المدرس
    reply: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    replyBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 👍 reactions
    reactions: [reactionSchema],

    reactionsCount: {
      type: Number,
      default: 0,
    },

    // 🗑 soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================== INDEX ================== */
commentSchema.index({ lesson: 1, createdAt: -1 });

/* ================== منع تكرار reaction ================== */
// كل user يعمل reaction واحدة فقط لكل كومنت
commentSchema.index(
  { _id: 1, "reactions.user": 1 },
  { unique: true, sparse: true }
);

/* ================== FILTER SOFT DELETE ================== */
commentSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

/* ================== MODEL ================== */
const CommentModel =
  mongoose.models.Comment || model("Comment", commentSchema);

export default CommentModel;