import rateLimit from "express-rate-limit";

// حماية الـ login و forgot-password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, // أقصى 5 طلبات لكل IP خلال 15 دقيقة
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, // يضيف X-RateLimit-* headers
  legacyHeaders: false,  // يمنع X-RateLimit-* القديم
});