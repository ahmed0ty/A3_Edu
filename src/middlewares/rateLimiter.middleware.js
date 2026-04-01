import rateLimit from "express-rate-limit";

// export const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5, 
//   message: {
//     success: false,
//     message: "Too many requests from this IP, please try again after 15 minutes"
//   },
//   standardHeaders: true, 
//   legacyHeaders: false,  
// });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, try again after 15 minutes"
    });
  },
});