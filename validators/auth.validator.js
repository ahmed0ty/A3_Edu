import { body } from "express-validator";
import { validationResult } from "express-validator";

// middleware لفحص الأخطاء
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// register validation
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["student", "instructor"])
    .withMessage("Role must be student or instructor"),

  validate
];

// login validation
export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];