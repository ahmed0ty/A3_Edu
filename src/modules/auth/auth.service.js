// import bcrypt from "bcrypt";
// import UserModel from "../../DB/models/user.model.js";
// import { sendEmail } from "../../utils/email.js";
// import { generateToken } from "../../utils/jwt.js";
// import { getIO } from "../../../socket.js";
// // ================= REGISTER =================
// export const register = async (data, file) => {
//   const { name, email, password } = data;

//   // 🔍 check email
//   const emailExist = await UserModel.findOne({ email });
//   if (emailExist) throw new Error("Email already exists");

//   // 🔐 hash password
//   const hashPassword = await bcrypt.hash(password, 10);

//   // 🔢 OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   // 👤 create user
//   const user = await UserModel.create({
//     name,
//     email,
//     password: hashPassword,
//     role: "student",
//     confirmEmailOTP: otp,
//     confirmEmailExpires: Date.now() + 10 * 60 * 1000,
//     isConfirmed: false,
//     profileImage: file?.path || ""
//   });

//   // 📧 side effect (email)
//   await sendEmail({
//     to: email,
//     subject: "Confirm your email",
//     html: `<h2>Your OTP is: ${otp}</h2>`
//   });

//   // 📦 return clean data only
//   return {
//     userId: user._id,
//     email: user.email,
//     name: user.name,
//     role: user.role
//   };
// };

// // ================= CONFIRM EMAIL =================
// export const confirmEmail = async (email, otp) => {
//   const user = await UserModel.findOne({ email });

//   if (!user) throw new Error("User not found");
//   if (user.isConfirmed) throw new Error("Already confirmed");

//   if (user.confirmEmailOTP !== otp) throw new Error("Invalid OTP");
//   if (user.confirmEmailExpires < Date.now()) throw new Error("OTP expired");

//   user.isConfirmed = true;
//   user.confirmEmailOTP = null;
//   user.confirmEmailExpires = null;

//   await user.save();

//   return {
//     userId: user._id,
//     email: user.email,
//     isConfirmed: user.isConfirmed
//   };
// };

// // ================= LOGIN =================
// export const login = async (data) => {
//   const { email, password } = data;

//   const user = await UserModel.findOne({ email });
//   if (!user) throw new Error("Invalid email or password");
//   if (!user.isConfirmed) throw new Error("Please confirm your email first");

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) throw new Error("Invalid email or password");

//   // ================= TOKENS =================
//   const accessToken = generateToken({ id: user._id, role: user.role }, "access");
//   const refreshToken = generateToken({ id: user._id, role: user.role }, "refresh");

//   // ================= REFRESH TOKENS =================
//   if (!user.refreshTokens) user.refreshTokens = [];

//   if (user.refreshTokens.length >= 5) {
//     user.refreshTokens.shift();
//   }

//   user.refreshTokens.push({ token: refreshToken });
//   await user.save();

//   const safeUser = {
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     instructorRequestStatus: user.instructorRequestStatus,
//     profileImage: user.profileImage,
//   };

//  return {
//     accessToken,
//     refreshToken,
//     user: safeUser
//   };
// };

// // ================= FORGOT PASSWORD =================
// export const forgotPassword = async (email) => {
//   const user = await UserModel.findOne({ email });
//   if (!user) throw new Error("User not found");

//   const otp = Math.floor(100000 + Math.random() + 900000).toString();

//   user.resetPasswordOTP = otp;
//   user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

//   await user.save();

//   await sendEmail({
//     to: email,
//     subject: "Reset Password",
//     html: `<h2>Your OTP is: ${otp}</h2>`
//   });

//   return {
//     email: user.email,
//     resetPasswordExpires: user.resetPasswordExpires
//   };
// };
// // ================= RESET PASSWORD =================
// export const resetPassword = async (email, otp, newPassword) => {
//   const user = await UserModel.findOne({ email });
//   if (!user) throw new Error("User not found");

//   if (user.resetPasswordOTP !== otp) throw new Error("Invalid OTP");
//   if (user.resetPasswordExpires < Date.now()) throw new Error("OTP expired");

//   const hashPassword = await bcrypt.hash(newPassword, 10);

//   user.password = hashPassword;
//   user.resetPasswordOTP = null;
//   user.resetPasswordExpires = null;

//   await user.save();

//   return {
//     userId: user._id,
//     email: user.email,
//     passwordReset: true
//   };
// };













import bcrypt from "bcrypt";
import UserModel from "../../DB/models/user.model.js";
import { sendEmail } from "../../utils/email.js";
import { generateToken } from "../../utils/jwt.js";
import { getIO } from "../../../socket.js";

// ================= REGISTER =================
export const register = async (data, file) => {
  const { name, email, password } = data;

  const emailExist = await UserModel.findOne({ email });
  if (emailExist) throw new Error("Email already exists");

  const hashPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await UserModel.create({
    name,
    email,
    password: hashPassword,
    role: "student",
    confirmEmailOTP: otp,
    confirmEmailExpires: Date.now() + 10 * 60 * 1000,
    isConfirmed: false,
    profileImage: file?.path || "",
  });

  sendEmail({
    to: email,
    subject: "Confirm your email",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  }).catch((error) => {
    console.error("❌ Background email error:", error.message);
  });

  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};
// ================= CONFIRM EMAIL =================
export const confirmEmail = async (email, otp) => {
  const user = await UserModel.findOne({ email });

  if (!user) throw new Error("User not found");
  if (user.isConfirmed) throw new Error("Already confirmed");

  if (user.confirmEmailOTP !== otp) throw new Error("Invalid OTP");
  if (user.confirmEmailExpires < Date.now()) throw new Error("OTP expired");

  user.isConfirmed = true;
  user.confirmEmailOTP = null;
  user.confirmEmailExpires = null;

  await user.save();

  return {
    userId: user._id,
    email: user.email,
    isConfirmed: user.isConfirmed,
  };
};

// ================= LOGIN =================
export const login = async (data) => {
  const { email, password } = data;

  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Invalid email or password");
  if (!user.isConfirmed) throw new Error("Please confirm your email first");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const accessToken = generateToken({ id: user._id, role: user.role }, "access");
  const refreshToken = generateToken({ id: user._id, role: user.role }, "refresh");

  if (!user.refreshTokens) user.refreshTokens = [];

  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift();
  }

  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    instructorRequestStatus: user.instructorRequestStatus,
    profileImage: user.profileImage,
  };

  return {
    accessToken,
    refreshToken,
    user: safeUser,
  };
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  try {
    const emailSent = await sendEmail({
      to: email,
      subject: "Reset Password",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    if (!emailSent) {
      console.warn("⚠️ Reset password email not sent");
    }
  } catch (error) {
    console.error("❌ Forgot password email error ignored:", error.message);
  }

  return {
    email: user.email,
    resetPasswordExpires: user.resetPasswordExpires,
  };
};

// ================= RESET PASSWORD =================
export const resetPassword = async (email, otp, newPassword) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.resetPasswordOTP !== otp) throw new Error("Invalid OTP");
  if (user.resetPasswordExpires < Date.now()) throw new Error("OTP expired");

  const hashPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashPassword;
  user.resetPasswordOTP = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    userId: user._id,
    email: user.email,
    passwordReset: true,
  };
};