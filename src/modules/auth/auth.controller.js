
import * as authService from "./auth.service.js";
import jwt from "jsonwebtoken";
import UserModel from "../../DB/models/user.model.js";
import { getIO } from "../../../socket.js"; // عدّل المسار حسب مشروعك
import { generateToken } from "../../utils/jwt.js";
import { clearCacheByPrefix } from "../../utils/cache.js";
// ================= REGISTER =================
export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body, req.file); // 🟢 مرّر req.file
   const io = getIO();

io.emit("user:created", {
  id: user.userId || user._id,
  name: user.name,
  role: user.role,
});


    res.status(201).json({
      success: true,
      message: "Registered successfully. Please confirm your email.",
      data: user
    });

  } catch (error) {
    next(error);
  }
};
// ================= CONFIRM EMAIL =================
export const confirmEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await authService.confirmEmail(email, otp);
    const io = getIO();

io.emit("user:confirmed", {
  email,
  status: "confirmed",
});

clearCacheByPrefix("users:");

    res.status(200).json({
      message: "Email confirmed successfully",
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// ================= LOGIN =================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExists = await UserModel.findOne({ email });
    if (!userExists) return res.status(400).json({ message: "Invalid credentials" });
    if (!userExists.isActive) return res.status(403).json({ message: "Account is deactivated" });

    const { accessToken, refreshToken, user } = await authService.login({ email, password });

    // 🍪 حفظ refresh token في HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true في production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    

    res.status(200).json({
  message: "Login successful",
  accessToken,
  user
});
  } catch (error) {
    next(error);
  }
};
// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      message: "OTP sent to your email"
    });

  } catch (error) {
    next(error);
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    await authService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {
    next(error);
  }
};



// ================= REFRESH TOKEN =================
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Refresh token expired or invalid" });
    }

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // تحقق من وجود التوكن في الـ DB
    const tokenExists = user.refreshTokens.some(rt => rt.token === token);
    if (!tokenExists) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // توليد access token جديد فقط
    const accessToken = generateToken({ id: user._id, role: user.role }, "access");

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    return res.status(500).json({ message: "Server error while refreshing token" });
  }
};

export const requestInstructor = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 لو instructor بالفعل
    if (user.role === "instructor") {
      return res.status(400).json({
        message: "You are already an instructor",
      });
    }

    // 🔥 لو الطلب pending
    if (user.instructorRequestStatus === "pending") {
      return res.status(400).json({
        message: "Request already pending",
      });
    }

    // 🔥 لازم صورة
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "ID image is required",
      });
    }

    // 🔥 update البيانات
    user.instructorRequestStatus = "pending";

    user.instructorRequestData = {
      fullName: req.body.fullName || "",
      idImage: req.file.path, // ✅ ده هو رابط Cloudinary
    };

    await user.save();

    // 🔥 SOCKET EMIT (المهم)
  // 🔥 SOCKET EVENT
const io = getIO();
io.emit("user:updated", {
  userId: user._id,
  status: "instructor_request_pending",
});
io.emit("instructorRequest:new");

await clearCacheByPrefix("users:");

    res.status(200).json({
      success: true,
      message: "Request sent successfully",
    });

  } catch (error) {
    next(error);
  }
};

export const approveInstructor = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "instructor";
    user.instructorRequestStatus = "approved";

    await user.save();

    const io = getIO();

io.emit("user:updated", {
  userId: user._id,
  role: "instructor",
  status: "approved",
});

await clearCacheByPrefix("users:");

    res.json({ message: "User is now instructor" });

  } catch (error) {
    next(error);
  }
};
// ================= LOGOUT =================
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      // حذف التوكن الحالي من الـ DB
      await UserModel.updateOne(
        { "refreshTokens.token": token },
        { $pull: { refreshTokens: { token } } }
      );
    }

     // 🔥 SOCKET (optional)
    const io = getIO();
    io.emit("user:loggedOut", {
      userId: req.user?._id || null,
    });


    // مسح الكوكي بغض النظر لو التوكن موجود أو لا
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // خليها true في production
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    next(error);
  }
};



