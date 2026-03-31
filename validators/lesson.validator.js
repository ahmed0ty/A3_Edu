import { body, param } from "express-validator";
import { validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// create lesson
export const createLessonValidation = [
  body("title")
    .isString().withMessage("Title must be string")
    .isLength({ min: 3 }).withMessage("Title too short"),

  body("content")
    .isString().withMessage("Content must be string"),

  body("course")
    .isMongoId().withMessage("Invalid course ID"),

  validate
];

// update lesson
export const updateLessonValidation = [
  param("id").isMongoId().withMessage("Invalid lesson ID"),

  body("title").optional().isString(),
  body("content").optional().isString(),

  validate
];

// get/delete lesson
export const lessonIdValidation = [
  param("id").isMongoId().withMessage("Invalid lesson ID"),
  validate
];