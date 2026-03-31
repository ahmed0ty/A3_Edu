// import * as lessonService from "./lesson.service.js";

// // ================= CREATE LESSON =================
// export const createLesson = async (req, res, next) => {
//   try {
//     const { title, type, content: bodyContent } = req.body;
//     const courseId = req.params.courseId;

//     let content = bodyContent || "";

//     // 🔥 لو فيه ملف مرفوع
//     if (req.file) {
//       content = req.file.path;
//     }

//     // ❌ validation
//     if (!title || !type || !courseId || !content) {
//       return res.status(400).json({
//         message: "Missing required fields",
//       });
//     }

//     // ✅ instructor من التوكن
//     const instructorId = req.user._id;

//     // ✅ create lesson
//     const lesson = await lessonService.createLesson(
//       {
//         title,
//         type,
//         content,
//         instructor: instructorId,
//       },
//       courseId
//     );

//     res.status(201).json({
//       success: true,
//       data: lesson,
//     });

//   } catch (err) {
//     console.error("❌ CREATE LESSON ERROR:", err);
//     next(err);
//   }
// };

// // ================= UPDATE LESSON =================
// export const updateLesson = async (req, res, next) => {
//   try {
//     const data = { ...req.body };

//     if (req.file) {
//       data.content = req.file.path;
//     }

//     const lesson = await lessonService.updateLesson(
//       req.params.id,
//       data
//     );

//     if (!lesson) {
//       return res.status(404).json({
//         message: "Lesson not found",
//       });
//     }

//     res.status(200).json({
//       message: "Lesson updated",
//       data: lesson,
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // ================= DELETE LESSON =================
// export const deleteLesson = async (req, res, next) => {
//   try {
//     const lesson = await lessonService.deleteLesson(req.params.id);

//     if (!lesson) {
//       return res.status(404).json({
//         message: "Lesson not found",
//       });
//     }

//     res.status(200).json({
//       message: "Lesson deleted successfully",
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // ================= GET ALL LESSONS =================
// export const getLessons = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;

//    const userId = req.user?._id;

// const lessons = await lessonService.getLessons(
//   req.params.courseId,
//   Number(page),
//   Number(limit),
//   userId // ✅ ابعت الـ userId
// );

//     res.status(200).json({
//       success: true,
//       data: lessons,
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // ================= GET SINGLE LESSON =================
// export const getLesson = async (req, res, next) => {
//   try {
//     const lesson = await lessonService.getLessonById(
//       req.params.id
//     );

//     if (!lesson) {
//       return res.status(404).json({
//         message: "Lesson not found",
//       });
//     }

//     res.status(200).json({
//       data: lesson,
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // ================= COMPLETE LESSON =================
// export const completeLesson = async (req, res, next) => {
//   try {
//     const lessonId = req.params.id;
//     const userId = req.user._id;

//     // ✅ complete على مستوى اليوزر مش الـ lesson
//     const lesson = await lessonService.completeLesson(lessonId, userId);

//     if (!lesson) {
//       return res.status(404).json({
//         message: "Lesson not found",
//       });
//     }

//     res.status(200).json({
//       message: "Lesson completed",
//       data: lesson,
//     });

//   } catch (error) {
//     next(error);
//   }
// };



























import * as lessonService from "./lesson.service.js";

// ================= CREATE LESSON =================
export const createLesson = async (req, res, next) => {
  try {
    const { title, type, content: bodyContent } = req.body;
    const courseId = req.params.courseId;

    let content = bodyContent || "";

    // لو فيه ملف مرفوع
    if (req.file) {
      content = req.file.path;
    }

    // validation
    if (!title || !type || !courseId || !content) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const instructorId = req.user._id;

    const lesson = await lessonService.createLesson(
      {
        title,
        type,
        content,
        instructor: instructorId,
      },
      courseId
    );

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    console.error("❌ CREATE LESSON ERROR:", err);
    next(err);
  }
};

// ================= UPDATE LESSON =================
export const updateLesson = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.content = req.file.path;
    }

    const lesson = await lessonService.updateLesson(req.params.id, data);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      message: "Lesson updated",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// ================= DELETE LESSON =================
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.deleteLesson(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET ALL LESSONS =================
export const getLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?._id;

    const lessons = await lessonService.getLessons(
      req.params.courseId,
      Number(page),
      Number(limit),
      userId
    );

    res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET SINGLE LESSON =================
export const getLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// ================= COMPLETE LESSON =================
export const completeLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user._id;

    const lesson = await lessonService.completeLesson(lessonId, userId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      message: "Lesson completed",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};