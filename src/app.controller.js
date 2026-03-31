import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { dbConnection } from "./DB/connection/connection.js";
import authRoutes from "./modules/auth/auth.routes.js";
import courseRoutes from "./modules/course/course.routes.js";
import lessonRoutes from "./modules/lesson/lesson.routes.js";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";
import userRoutes from "./modules/users/user.routes.js";
import quizRoutes from "./modules/quizzes/quiz.routes.js";
import cookieParser from "cookie-parser";
import redisClient from "./config/redis.js";
import commentRoutes from "./modules/comments/comment.routes.js";

dotenv.config();

export const bootstrap = async () => {
  const app = express();

  // middlewares
  app.use(
    cors({
      origin: "https://a3-edu.onrender.com", // الفرونت بتاعك
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(cookieParser());

  // انتظر الـ database connection
  await dbConnection();

  app.use(logger);

  // routes
  app.use("/auth", authRoutes);
  app.use("/courses", courseRoutes);
  app.use("/lessons", lessonRoutes);
  app.use("/enrollments", enrollmentRoutes);
  app.use("/users", userRoutes);
  app.use("/quizzes", quizRoutes);
  app.use("/comments", commentRoutes);
  app.get("/clear-cache", async (req, res) => {
    await redisClient.flushAll();
    res.send("Cache cleared 🔥");
  });

  // test route
  app.get("/", (req, res) => {
    res.send("Server is running 🚀");
  });

  // ❗ Not Found Handler (مهم)
  app.use((req, res, next) => {
    next(new Error(`Route not found: ${req.originalUrl}`));
  });
  // 🔥 Global Error Handler (آخر حاجة)
  app.use(globalErrorHandler);

  return app;
};
