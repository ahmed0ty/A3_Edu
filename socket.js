import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
io = new Server(server, {
    cors: {
      origin: [
  "http://localhost:5173",
  "https://a3-edu-front-end.vercel.app",
],
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true, // ✅ مهم
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // ✅ غرفة اليوزر (للـ instructor requests)
    socket.on("joinUserRoom", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 ${socket.id} joined user room: user_${userId}`);
    });

    // غرفة الدرس
    socket.on("joinLessonRoom", (lessonId) => {
      console.log("👥 User joined room:", lessonId);
      socket.join(lessonId);
      console.log(`🔹 ${socket.id} joined lesson ${lessonId}`);
    });

    // الخروج من غرفة درس
    socket.on("leaveLessonRoom", (lessonId) => {
      socket.leave(lessonId);
      console.log(`🔹 ${socket.id} left lesson ${lessonId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};