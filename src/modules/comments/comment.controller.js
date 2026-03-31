import { getIO } from "../../../socket.js";
import CommentModel from "../../DB/models/comment.model.js";
import * as commentService from "./comment.service.js";

// ================= CREATE COMMENT =================
export const createComment = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const comment = await commentService.createComment(
      lessonId,
      req.user._id, // أو _id حسب اللي عندك في middleware
      req.body.content
    );

    // 🔥 Socket
    const io = getIO();

    io.to(lessonId.toString()).emit("newComment", comment);

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// ================= REPLY COMMENT =================
export const replyComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await commentService.replyComment(
      commentId,
      req.user._id, // 🔥 استخدم id (مش _id)
      req.body.reply
    );

    // 🔥 Socket
    const io = getIO();

    // نبعث تحديث للكومنت كامل
    io.to(comment.lesson.toString()).emit("commentUpdated", comment);

    res.json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// ================= REACT COMMENT =================
export const reactComment = async (req, res, next) => {
  try {
    const { type } = req.body;
    const userId = req.user._id; // ✅ بدل _id

    // ✅ استدعاء الخدمة
    const comment = await commentService.reactComment(
      req.params.commentId,
      userId,
      type
    );

    // 🔥 Socket emit
    const io = getIO();
    io.to(comment.lesson.toString()).emit("reactComment", comment);

    res.json({
      success: true,
      data: comment,
    });

  } catch (err) {
    next(err);
  }
};
// ================= GET COMMENTS =================
export const getComments = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const data = await commentService.getComments(
      lessonId,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.log("GET COMMENTS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const userId = req.user._id;
    const userRole = req.user.role;

    // ✅ Validation
    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

        // 🔥 هنا حط الـ logs
    console.log("comment.user:", comment.user);
    console.log("userId:", userId);

    // 👇 الصلاحيات
const isOwner = comment.user.equals(userId);
const isInstructor = userRole === "instructor";

if (!isOwner && !isInstructor) {
  return res.status(403).json({
    success: false,
    message: "Not allowed",
  });
}

    // ✏️ التعديل
    comment.content = content;
    await comment.save();

    console.log("➡️ lessonId from comment:", comment.lesson.toString());
console.log("➡️ emitting update...");

    // 🔥 Socket emit
    const io = getIO();

    io.to(comment.lesson.toString()).emit("commentUpdated", comment);

    res.json({
      success: true,
      data: comment,
    });

  } catch (error) {
    console.log("UPDATE COMMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // 👇 الصلاحيات
    const isOwner = comment.user.toString() === userId
    const isInstructor = userRole === "instructor";

    if (!isOwner && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this comment",
      });
    }

    // 🗑️ حذف نهائي (مهم: احفظ الليسون قبل الحذف)
    const lessonId = comment.lesson.toString();

    await CommentModel.findByIdAndDelete(commentId);

    // 🔥 Socket
    const io = getIO();

    io.to(lessonId).emit("commentDeleted", {
      commentId,
    });

    res.json({
      success: true,
      message: "Comment permanently deleted",
    });

  } catch (error) {
    console.log("❌ DELETE COMMENT ERROR:", error);
    next(error);
  }
};