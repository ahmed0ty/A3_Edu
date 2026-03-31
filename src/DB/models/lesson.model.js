// import mongoose, { Schema, model } from "mongoose";

// const lessonSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 3,
//       maxlength: 200
//     },

//     course: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: true
//     },

//     // 🔥 نوع الدرس
//     type: {
//       type: String,
//       enum: ["video", "pdf", "text", "link"],
//       required: true
//     },

//     // 🔥 المحتوى (لينك أو نص)
//     content: {
//       type: String,
//       required: true
//     },

//     // 🎥 لو فيديو
//     duration: {
//       type: Number,
//       default: 0
//     },

//     // 🔢 ترتيب الدرس
//     order: {
//       type: Number,
//       default: 0
//     },

//     // 🔓 هل مجاني (preview)
//     isFree: {
//       type: Boolean,
//       default: false
//     }
//   },
//   { timestamps: true }
// );

// const LessonModel = model("Lesson", lessonSchema);

// export default LessonModel;

import mongoose, { Schema, model } from "mongoose";

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["video", "pdf", "text", "link"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

/* ================== INDEX ================== */
lessonSchema.index({ course: 1, order: 1 });

/* ================== FILTER DELETED ================== */
lessonSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

/* ================== MODEL ================== */
const LessonModel =
  mongoose.models.Lesson || model("Lesson", lessonSchema);

export default LessonModel;