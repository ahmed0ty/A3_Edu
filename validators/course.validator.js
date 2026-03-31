import { body, param } from "express-validator";
import { validationResult } from "express-validator";

// middleware مشترك
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

// create course
export const createCourseValidation = [
  body("title")
    .isString().withMessage("Title must be string")
    .isLength({ min: 3 }).withMessage("Title must be at least 3 chars"),

  body("description")
    .isString().withMessage("Description must be string")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 chars"),

  body("price")
    .isNumeric().withMessage("Price must be a number"),

  validate
];

// update course
export const updateCourseValidation = [
  param("id").isMongoId().withMessage("Invalid course ID"),

  body("title").optional().isString(),
  body("description").optional().isString(),
  body("price").optional().isNumeric(),

  validate
];

// get / delete course
export const courseIdValidation = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  validate
];