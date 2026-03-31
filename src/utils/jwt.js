// src/utils/jwt.js
import jwt from "jsonwebtoken";

/**
 * توليد توكن
 * @param {Object} payload - البيانات اللي عايز تحطها في التوكن (مثلاً id المستخدم)
 * @param {String} type - "access" أو "refresh" عشان نستخدم secret مختلف
 * @returns {String} JWT
 */
export const generateToken = (payload, type = "access") => {
  const secret = type === "access" ? process.env.ACCESS_SECRET : process.env.REFRESH_SECRET;
  const expiresIn = type === "access" ? "15m" : "7d"; // Access قصير، Refresh طويل
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * التحقق من صحة التوكن
 * @param {String} token - التوكن اللي جاي من العميل
 * @param {String} type - "access" أو "refresh"
 * @returns {Object} بيانات التوكن بعد فك التشفير
 */
export const verifyToken = (token, type = "access") => {
  try {
    const secret = type === "access" ? process.env.ACCESS_SECRET : process.env.REFRESH_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};