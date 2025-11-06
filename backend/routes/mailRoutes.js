import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * POST /api/mail/send-reset-link
 * Expects: { email }
 * Sends password reset email using Gmail (App Password) or Ethereal (test)
 */
router.post("/send-reset-link", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });

  try {
    const MAIL_USER = process.env.MAIL_USER;
    const MAIL_PASS = process.env.MAIL_PASS;
    const MAIL_FROM =
      process.env.MAIL_FROM ||
      (MAIL_USER
        ? `"HVMS Admin" <${MAIL_USER}>`
        : "HVMS Admin <no-reply@example.com>");

    let transporter;

    // ✅ If Gmail credentials exist, use Gmail SMTP
    if (MAIL_USER && MAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        },
      });
      console.log("📧 Using Gmail SMTP to send email");
    } else {
      // 🧪 Fallback: Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("🧪 Using Ethereal test account:", testAccount.user);
    }

    // ✉️ Create the email
    const resetLink = `http://localhost:5173/reset-password?email=${encodeURIComponent(
      email
    )}`;
    const mailOptions = {
      from: MAIL_FROM,
      to: email,
      subject: "HVMS Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>HVMS Password Reset</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Click below to proceed:</p>
          <a href="${resetLink}"
             style="display:inline-block;background-color:#facc15;color:#000;
             padding:10px 15px;text-decoration:none;border-radius:5px;font-weight:bold;">
            Reset Password
          </a>
          <p>If you did not request this, please ignore this email.</p>
          <hr/>
          <small>This link will expire in 30 minutes for your security.</small>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // 🧪 Ethereal mode (preview only)
    if (!MAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("📨 Ethereal preview:", previewUrl);
      return res.json({
        success: true,
        message: "Ethereal email sent (preview only)",
        previewUrl,
      });
    }

    console.log("✅ Email sent successfully:", info.response);
    res.json({
      success: true,
      message: "✅ Password reset email sent successfully!",
    });
  } catch (error) {
    console.error("❌ Mail send error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
      hint:
        "If using Gmail, create an App Password at https://myaccount.google.com/apppasswords and set MAIL_USER + MAIL_PASS in .env",
    });
  }
});

export default router;
