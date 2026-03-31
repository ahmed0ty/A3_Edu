// import * as quizService from "./quiz.service.js";
// import redisClient from "../../config/redis.js";
// import { courseQuizzesKey } from "../../utils/cacheKeys.js";
// import Attempt from "../../DB/models/quizAttempt.model.js";
// import QuizModel from "../../DB/models/quiz.model.js";
// import QuizAttemptModel from "../../DB/models/quizAttempt.model.js";
// import mongoose from "mongoose";
// import cloudinary from "../../config/cloudinary.js";
// import { getIO } from "../../../socket.js"; // ✅ Socket
// // 👨‍🏫 Instructor
// export const createQuiz = async (req, res) => {
//   try {
//     console.log("🔥 CREATE QUIZ BODY:", req.body);
//     console.log("👤 USER:", req.user);

//     let { title, description, course, duration, startAt, endAt, questions } =
//       req.body;

//     if (typeof questions === "string") {
//       questions = JSON.parse(questions);
//     }

//     if (!title || !course || !startAt || !endAt) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     let imageUrl = "";

//     // 🎯 Quiz image
//     if (req.files?.image?.[0]) {
//       const file = req.files.image[0];

//       const result = await new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { folder: "quizzes" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           },
//         );
//         uploadStream.end(file.buffer);
//       });

//       imageUrl = result.secure_url;
//     }

//     // 🎯 Question images
//     const questionImages = req.files?.questionImages || [];

//     if (questionImages.length) {
//       for (let i = 0; i < questions.length; i++) {
//         if (questionImages[i]) {
//           const result = await new Promise((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//               { folder: "quizzes/questions" },
//               (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result);
//               },
//             );
//             uploadStream.end(questionImages[i].buffer);
//           });

//           questions[i].image = result.secure_url;
//         }
//       }
//     }

//     // 💾 Save
//     const quiz = await QuizModel.create({
//       title,
//       description,
//       course,
//       duration,
//       startAt,
//       endAt,
//       questions,
//       createdBy: req.user._id,
//       image: imageUrl,
//     });

//     // ✅ 🔥 SOCKET EMIT
//     const io = getIO();
//     io.emit("quiz:updated", { courseId: quiz.course });

//     return res.status(201).json({
//       success: true,
//       data: quiz,
//     });
//   } catch (err) {
//     console.error("❌ CREATE QUIZ ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server Error",
//     });
//   }
// };

// export const updateQuiz = async (req, res, next) => {
//   try {
//     let updateData = { ...req.body };

//     if (updateData.questions && typeof updateData.questions === "string") {
//       updateData.questions = JSON.parse(updateData.questions);
//     }

//     // 🎯 Quiz image
//     if (req.files?.image?.[0]) {
//       const file = req.files.image[0];

//       const result = await new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { folder: "quizzes" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           },
//         );
//         uploadStream.end(file.buffer);
//       });

//       updateData.image = result.secure_url;
//     }

//     // 🎯 Question images
//     const questionImages = req.files?.questionImages || [];

//     if (updateData.questions && questionImages.length) {
//       for (let i = 0; i < updateData.questions.length; i++) {
//         if (questionImages[i]) {
//           const result = await new Promise((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//               { folder: "quizzes/questions" },
//               (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result);
//               },
//             );
//             uploadStream.end(questionImages[i].buffer);
//           });

//           updateData.questions[i].image = result.secure_url;
//         }
//       }
//     }

//     const updated = await quizService.updateQuiz(
//       req.params.id,
//       req.user._id,
//       updateData,
//     );

//     // ✅ 🔥 SOCKET EMIT
//     const io = getIO();
//     io.emit("quiz:updated", { courseId: updated.course });

//     res.status(200).json({
//       message: "Quiz updated",
//       data: updated,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const deleteQuiz = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Quiz id is required",
//       });
//     }

//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: user not found",
//       });
//     }

//     // 👇 مهم: هات الكويز قبل الحذف عشان courseId
//     const quiz = await QuizModel.findById(id);

//     const result = await quizService.deleteQuiz(id, req.user._id);

//     // ✅ 🔥 SOCKET EMIT
//     const io = getIO();
//     io.emit("quiz:updated", { courseId: quiz.course });

//     return res.status(200).json({
//       success: true,
//       message: "Quiz deleted successfully",
//       data: result,
//     });
//   } catch (err) {
//     console.error("🔥 DELETE ERROR:", err);

//     if (err.message === "Quiz not found or unauthorized") {
//       return res.status(404).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// export const getQuizResults = async (req, res, next) => {
//   try {
//     const results = await quizService.getQuizResults(
//       req.params.id,
//       req.user._id,
//     );

//     res.status(200).json({ data: results });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getCourseResults = async (req, res, next) => {
//   try {
//     const results = await quizService.getCourseResults(
//       req.params.courseId,
//       req.user._id,
//     );

//     res.status(200).json({ data: results });
//   } catch (err) {
//     next(err);
//   }
// };

// // 🎓 Student
// export const getQuizzesForCourse = async (req, res) => {
//   try {
//     const studentId = req.user._id;
//     const now = new Date();

//     const quizzes = await QuizModel.find({ course: req.params.courseId })
//       .select("-questions.correctAnswer")
//       .lean();

//     const quizIds = quizzes.map((q) => q._id);

//     const attempts = await QuizAttemptModel.find({
//       student: studentId,
//       quiz: { $in: quizIds },
//     }).lean();

//     const formatted = quizzes.map((q) => {
//       const start = new Date(q.startAt);
//       const end = new Date(q.endAt);

//       let status = now < start ? "upcoming" : now <= end ? "open" : "closed";

//       const attempt = attempts.find(
//         (a) => a.quiz.toString() === q._id.toString(),
//       );

//       return {
//         _id: q._id,
//         title: q.title,
//         course: q.course,
//         startAt: q.startAt,
//         endAt: q.endAt,
//         status,
//         attempt: attempt || null,
//         completed: !!attempt?.completedAt,
//       };
//     });

//     return res.json({
//       success: true,
//       data: formatted,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// };

// export const submitQuiz = async (req, res, next) => {
//   try {
//     const { attemptId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(attemptId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid attempt id",
//       });
//     }

//     const attempt = await quizService.submitQuiz(
//       attemptId,
//       req.user._id,
//       req.body.answers,
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Submitted",
//       data: attempt,
//     });
//   } catch (err) {
//     console.error("❌ submitQuiz error:", err.message);

//     if (err.message === "Attempt not found") {
//       return res.status(404).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error",
//     });
//   }
// };

// export const getAttempt = async (req, res, next) => {
//   try {
//     const { attemptId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(attemptId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid attempt id",
//       });
//     }

//     const result = await quizService.getAttempt(attemptId, req.user._id);

//     return res.status(200).json({
//       success: true,
//       completed: result.completed,
//       data: result.data,
//     });
//   } catch (err) {
//     console.error("❌ getAttempt error:", err.message);

//     if (err.message === "Attempt not found") {
//       return res.status(404).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// export const getMyResult = async (req, res, next) => {
//   try {
//     const result = await quizService.getMyResult(
//       req.params.quizId,
//       req.user._id,
//     );

//     res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getInstructorQuizzes = async (req, res) => {
//   try {
//     console.log("USER:", req.user);

//     const quizzes = await QuizModel.find({ createdBy: req.user._id });

//     res.json({ success: true, data: quizzes });
//   } catch (err) {
//     console.error("ERROR:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export const getQuizById = async (req, res) => {
//   try {
//     const quiz = await QuizModel.findById(req.params.id);

//     if (!quiz) {
//       return res.status(404).json({
//         success: false,
//         message: "Quiz not found",
//       });
//     }

//     res.json({ success: true, data: quiz });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// export const startQuizController = async (req, res) => {
//   try {
//     console.log("🚀 START QUIZ REQUEST");
//     console.log("quizId:", req.params.id);
//     console.log("user:", req.user);

//     const result = await quizService.startQuiz(req.params.id, req.user._id);

//     if (!result || !result.attemptId) {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to start quiz",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       completed: result.completed || false,
//       attemptId: result.attemptId,
//       message: result.message || null,
//     });
//   } catch (err) {
//     console.error("❌ CONTROLLER ERROR:", err.message);

//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };











































import * as quizService from "./quiz.service.js";
import { courseQuizzesKey } from "../../utils/cacheKeys.js";
import Attempt from "../../DB/models/quizAttempt.model.js";
import QuizModel from "../../DB/models/quiz.model.js";
import QuizAttemptModel from "../../DB/models/quizAttempt.model.js";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import { getIO } from "../../../socket.js";

// 👨‍🏫 Instructor
export const createQuiz = async (req, res) => {
  try {
    console.log("🔥 CREATE QUIZ BODY:", req.body);
    console.log("👤 USER:", req.user);

    let { title, description, course, duration, startAt, endAt, questions } =
      req.body;

    if (typeof questions === "string") {
      questions = JSON.parse(questions);
    }

    if (!title || !course || !startAt || !endAt) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let imageUrl = "";

    // 🎯 Quiz image
    if (req.files?.image?.[0]) {
      const file = req.files.image[0];

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "quizzes" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      imageUrl = result.secure_url;
    }

    // 🎯 Question images
    const questionImages = req.files?.questionImages || [];

    if (questionImages.length) {
      for (let i = 0; i < questions.length; i++) {
        if (questionImages[i]) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "quizzes/questions" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(questionImages[i].buffer);
          });

          questions[i].image = result.secure_url;
        }
      }
    }

    // 💾 Save
    const quiz = await QuizModel.create({
      title,
      description,
      course,
      duration,
      startAt,
      endAt,
      questions,
      createdBy: req.user._id,
      image: imageUrl,
    });

    // ✅ 🔥 SOCKET EMIT
    const io = getIO();
    io.emit("quiz:updated", { courseId: quiz.course });

    return res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    console.error("❌ CREATE QUIZ ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    if (updateData.questions && typeof updateData.questions === "string") {
      updateData.questions = JSON.parse(updateData.questions);
    }

    // 🎯 Quiz image
    if (req.files?.image?.[0]) {
      const file = req.files.image[0];

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "quizzes" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      updateData.image = result.secure_url;
    }

    // 🎯 Question images
    const questionImages = req.files?.questionImages || [];

    if (updateData.questions && questionImages.length) {
      for (let i = 0; i < updateData.questions.length; i++) {
        if (questionImages[i]) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "quizzes/questions" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(questionImages[i].buffer);
          });

          updateData.questions[i].image = result.secure_url;
        }
      }
    }

    const updated = await quizService.updateQuiz(
      req.params.id,
      req.user._id,
      updateData
    );

    // ✅ 🔥 SOCKET EMIT
    const io = getIO();
    io.emit("quiz:updated", { courseId: updated.course });

    res.status(200).json({
      message: "Quiz updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Quiz id is required",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    // 👇 مهم: هات الكويز قبل الحذف عشان courseId
    const quiz = await QuizModel.findById(id);

    const result = await quizService.deleteQuiz(id, req.user._id);

    // ✅ 🔥 SOCKET EMIT
    const io = getIO();
    io.emit("quiz:updated", { courseId: quiz.course });

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
      data: result,
    });
  } catch (err) {
    console.error("🔥 DELETE ERROR:", err);

    if (err.message === "Quiz not found or unauthorized") {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getQuizResults = async (req, res, next) => {
  try {
    const results = await quizService.getQuizResults(
      req.params.id,
      req.user._id
    );

    res.status(200).json({ data: results });
  } catch (err) {
    next(err);
  }
};

export const getCourseResults = async (req, res, next) => {
  try {
    const results = await quizService.getCourseResults(
      req.params.courseId,
      req.user._id
    );

    res.status(200).json({ data: results });
  } catch (err) {
    next(err);
  }
};

// 🎓 Student
export const getQuizzesForCourse = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    const quizzes = await QuizModel.find({ course: req.params.courseId })
      .select("-questions.correctAnswer")
      .lean();

    const quizIds = quizzes.map((q) => q._id);

    const attempts = await QuizAttemptModel.find({
      student: studentId,
      quiz: { $in: quizIds },
    }).lean();

    const formatted = quizzes.map((q) => {
      const start = new Date(q.startAt);
      const end = new Date(q.endAt);

      let status = now < start ? "upcoming" : now <= end ? "open" : "closed";

      const attempt = attempts.find(
        (a) => a.quiz.toString() === q._id.toString()
      );

      return {
        _id: q._id,
        title: q.title,
        course: q.course,
        startAt: q.startAt,
        endAt: q.endAt,
        status,
        attempt: attempt || null,
        completed: !!attempt?.completedAt,
      };
    });

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt id",
      });
    }

    const attempt = await quizService.submitQuiz(
      attemptId,
      req.user._id,
      req.body.answers
    );

    return res.status(200).json({
      success: true,
      message: "Submitted",
      data: attempt,
    });
  } catch (err) {
    console.error("❌ submitQuiz error:", err.message);

    if (err.message === "Attempt not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const getAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt id",
      });
    }

    const result = await quizService.getAttempt(attemptId, req.user._id);

    return res.status(200).json({
      success: true,
      completed: result.completed,
      data: result.data,
    });
  } catch (err) {
    console.error("❌ getAttempt error:", err.message);

    if (err.message === "Attempt not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMyResult = async (req, res, next) => {
  try {
    const result = await quizService.getMyResult(
      req.params.quizId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getInstructorQuizzes = async (req, res) => {
  try {
    console.log("USER:", req.user);

    const quizzes = await QuizModel.find({ createdBy: req.user._id });

    res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await QuizModel.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({ success: true, data: quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const startQuizController = async (req, res) => {
  try {
    console.log("🚀 START QUIZ REQUEST");
    console.log("quizId:", req.params.id);
    console.log("user:", req.user);

    const result = await quizService.startQuiz(req.params.id, req.user._id);

    if (!result || !result.attemptId) {
      return res.status(400).json({
        success: false,
        message: "Failed to start quiz",
      });
    }

    return res.status(200).json({
      success: true,
      completed: result.completed || false,
      attemptId: result.attemptId,
      message: result.message || null,
    });
  } catch (err) {
    console.error("❌ CONTROLLER ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};