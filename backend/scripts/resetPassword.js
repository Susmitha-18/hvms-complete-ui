import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

dotenv.config()

const [,, username, newPassword] = process.argv

if (!username || !newPassword) {
  console.error('Usage: node resetPassword.js <username> <newPassword>')
  process.exit(2)
}

const run = async () => {
  try {
    await connectDB()

    const user = await User.findOne({ username })
    if (!user) {
      console.error('❌ User not found')
      process.exit(1)
    }

    // 🔒 Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    user.password = hashedPassword
    await user.save()
    console.log(`✅ Password reset and hashed for ${username}`)

    // ✉️ Try to send mail if mail config is set
    if (process.env.MAIL_USER && process.env.MAIL_PASS && user.username) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        })

        const mailOptions = {
          from: `"HVMS Admin" <${process.env.MAIL_USER}>`,
          to: process.env.ADMIN_NOTIFY || process.env.MAIL_USER, // sends to admin or fallback
          subject: 'HVMS Password Reset Notification',
          html: `
            <h2>Password Reset Successful</h2>
            <p>User <b>${username}</b>'s password was reset successfully.</p>
            <p><b>New Password:</b> ${newPassword}</p>
            <p>Login and change it as soon as possible for security.</p>
          `
        }

        await transporter.sendMail(mailOptions)
        console.log(`📩 Notification email sent to ${mailOptions.to}`)
      } catch (mailErr) {
        console.warn('⚠️ Could not send email:', mailErr.message)
      }
    } else {
      console.log('⚠️ MAIL_USER/MAIL_PASS not configured, skipping email send.')
    }

    process.exit(0)
  } catch (e) {
    console.error('❌ Error:', e.message)
    process.exit(1)
  }
}

run()
