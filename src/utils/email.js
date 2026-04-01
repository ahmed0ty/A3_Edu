
// import nodemailer from "nodemailer";

// console.log("EMAIL:", process.env.EMAIL);
// console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

// const createTransporter = () => {
//   if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
//     console.warn("⚠️ Email credentials missing → skipping email sending");
//     return null;
//   }

// return nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   family: 4,
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASS,
//   },
// });
// };

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const transporter = createTransporter();

//     if (!transporter) {
//       console.error("❌ Transporter is null — check EMAIL and EMAIL_PASS");
//       return false;
//     }

//     await transporter.verify();
//     console.log("✅ Transporter verified successfully");

//     const info = await transporter.sendMail({
//       from: `"Edu Platform" <${process.env.EMAIL}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("📨 Email sent:", info.messageId);
//     return true;

//   } catch (error) {
//     console.error("❌ Email error FULL:", error); // 🔥 هيبين السبب كامل
//     return false;
//   }
// };









import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 3,
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = getTransporter();
    if (!t) return false;

    const info = await t.sendMail({
      from: `"Edu Platform" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ Email error:", error.message);
    transporter = null;
    return false;
  }
};