import UserModel from "../DB/models/user.model.js";
import { verifyToken } from "../utils/jwt.js";
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
        // 🔥 حط الكونسول هنا
    console.log("🔐 AUTH HEADER:", req.headers.authorization);
    console.log("🎟 TOKEN:", token);

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = verifyToken(token, "access");

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.id || decoded.userId;

    const user = await UserModel.findById(userId).select("name role email");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔥 هنا التعديل المهم
    req.user = {
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.log("❌ ERROR:", error.message);

    if (error.message.includes("expired")) {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};