import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'VidiOfficialID <noreply@vidiofficialid.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Selamat Datang di VidiOfficialID! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #FDC435; padding: 40px; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 28px;">VidiOfficialID</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #000; margin: 0 0 20px;">Halo ${name || 'Sobat'}! 👋</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Selamat datang di VidiOfficialID! Akun kamu sudah berhasil dibuat.
              </p>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Sekarang kamu bisa mulai mengumpulkan video testimonial dari pelanggan untuk mengembangkan bisnismu.
              </p>
              <a href="${APP_URL}/dashboard" style="display: inline-block; background: #000; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0;">
                Masuk ke Dashboard
              </a>
              <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0;">
                Butuh bantuan? Balas email ini dan tim kami akan membantu kamu.
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} VidiOfficialID. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Password - VidiOfficialID',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #FDC435; padding: 40px; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 28px;">VidiOfficialID</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #000; margin: 0 0 20px;">Reset Password 🔐</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Kami menerima permintaan untuk mereset password akun kamu. Klik tombol di bawah untuk membuat password baru.
              </p>
              <a href="${resetLink}" style="display: inline-block; background: #000; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0;">
                Reset Password
              </a>
              <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0;">
                Link ini akan kadaluarsa dalam 1 jam. Jika kamu tidak meminta reset password, abaikan email ini.
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} VidiOfficialID. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}
