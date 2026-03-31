import "dotenv/config";
import dns from "dns";

// 👇 مهم جدًا: لازم يكون قبل أي اتصال بالـ MongoDB
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import { bootstrap } from "./app.controller.js";
import { initSocket } from "../socket.js";
import http from "node:http";

const startServer = async () => {
  try {
    const app = await bootstrap();

    // 🔥 إنشاء HTTP server
    const server = http.createServer(app);

    // 🔥 ربط Socket.IO
    initSocket(server);

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();