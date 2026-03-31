import nodemailer from "nodemailer";
// 👇 حطهم هنا
console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
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