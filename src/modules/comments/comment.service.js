import CommentModel from "../../DB/models/comment.model.js";
import LessonModel from "../../DB/models/lesson.model.js";
import EnrollmentModel from "../../DB/models/enrollment.model.js";
import { getIO } from "../../../socket.js";
import CourseModel from "../../DB/models/course.model.js";

// ================= CREATE COMMENT =================
export const createComment = async (lessonId, userId, content) => {
  const lesson = await LessonModel.findById(lessonId);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // 🚫 منع السبام
  const lastComment = await CommentModel.findOne({
    lesson: lessonId,
    user: userId,
  }).sort({ createdAt: 1 });

  if (
    lastComment &&
    Date.now() - new Date(lastComment.createdAt).getTime() < 10000
  ) {
    throw new Error("Please wait before posting another comment");
  }

  // 📝 إنشاء الكومنت
  let comment = await CommentModel.create({
    lesson: lessonId,
    user: userId,
    content,
  });

  // 🔥 نعمل populate قبل ما نرجعه
  comment = await comment.populate("user", "name profileImage");

  // 📊 تحديث عدد الكومنتات
  await LessonModel.findByIdAndUpdate(lessonId, {
    $inc: { commentsCount: 1 },
  });

  // 🔥 realtime (لو شغال عندك)
  const io = getIO();
  io.to(lessonId.toString()).emit("newComment", comment);

  return comment;
};
// ================= REPLY COMMENT (Instructor only) =================
export const replyComment = async (commentId, instructorId, reply) => {
  const comment = await CommentModel.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) throw new Error("Comment not found");

  // 📝 إضافة الرد
  comment.reply = reply;
  comment.replyBy = instructorId;

  await comment.save();

  // 🔥 نجيب الداتا كاملة بعد الحفظ + populate
  const populatedComment = await CommentModel.findById(comment._id)
    .populate("user", "name profileImage")
    .populate("replyBy", "name profileImage")
    .populate("reactions.user", "name profileImage")
    .lean();

  // 🔥 realtime emit بالداتا الكاملة
  const io = getIO();
  io.to(comment.lesson.toString()).emit("newReply", populatedComment);

  return populatedComment;
};
// ================= REACT COMMENT =================
export const reactComment = async (commentId, userId, type) => {
  const comment = await CommentModel.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // 🔥 البحث عن reaction للمستخدم
  const existingIndex = comment.reactions.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingIndex > -1) {
    const existingReaction = comment.reactions[existingIndex];

    // 🔄 نفس النوع → حذف
    if (existingReaction.type === type) {
      comment.reactions.splice(existingIndex, 1);
    } else {
      // 🔄 تغيير النوع
      comment.reactions[existingIndex].type = type;
    }
  } else {
    // ➕ إضافة reaction جديد
    comment.reactions.push({
      user: userId, // ✅ مهم جدًا
      type,
    });
  }

  // 🔢 تحديث العدد
  comment.reactionsCount = comment.reactions.length;

  // 💾 حفظ
  await comment.save();

  // 🔥 رجع الداتا بعد populate
  const updatedComment = await CommentModel.findById(commentId)
    .populate("user", "name profileImage")
    .populate("replyBy", "name")
    .populate("reactions.user", "name profileImage");

  return updatedComment;
};
// ================= GET COMMENTS (paginated) =================
export const getComments = async (lessonId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query = {
    lesson: lessonId,
    isDeleted: false,
  };

  const [comments, total] = await Promise.all([
    CommentModel.find(query)
      .populate("user", "name profileImage")
      .populate("replyBy", "name")
      .populate("reactions.user", "name profileImage") // ✅ مهم للـ modal
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(), // 🔥 performance أحسن

    CommentModel.countDocuments(query),
  ]);

  return {
    comments,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};




export const deleteComment = async (commentId, user) => {
  const comment = await CommentModel.findById(commentId);

  if (!comment) throw new Error("Comment not found");

  // 👇 لو مش صاحب الكومنت ولا instructor → امنعه
  if (
    comment.user.toString() !== user._id.toString() &&
    user.role !== "instructor"
  ) {
    throw new Error("Not authorized to delete");
  }

  // 🗑 soft delete
  comment.isDeleted = true;
  await comment.save();

  return comment;
};