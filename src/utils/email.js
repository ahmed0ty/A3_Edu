// src/utils/email.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // إنشاء transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    // تحقق من الاتصال بـ Gmail
    await transporter.verify();
    console.log("✅ Email server is ready");

    // إرسال الإيميل
    const info = await transporter.sendMail({
      from: `"Edu Platform" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw new Error("Failed to send email");
  }
};