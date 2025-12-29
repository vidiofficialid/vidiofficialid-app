import emailjs from '@emailjs/nodejs'

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_n08cf5h'
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || '4jOdYo5p199g2Ykm-'
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '-mLf4eBbPUM1tDAwxXPQc'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await emailjs.send(
      SERVICE_ID,
      'template_ux5bbl4',
      {
        to_email: email,
        to_name: name || 'Sobat',
        subject: 'Selamat Datang di VidiOfficialID! 🎉',
        message: `Halo ${name || 'Sobat'}! Selamat datang di VidiOfficialID. Akun kamu sudah berhasil dibuat. Kunjungi ${APP_URL}/dashboard untuk mulai.`,
        dashboard_link: `${APP_URL}/dashboard`,
      },
      {
        publicKey: PUBLIC_KEY,
        privateKey: PRIVATE_KEY,
      }
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    await emailjs.send(
      SERVICE_ID,
      'template_ux5bbl4',
      {
        to_email: email,
        to_name: 'User',
        subject: 'Reset Password - VidiOfficialID',
        message: `Klik link berikut untuk reset password: ${resetLink}. Link akan kadaluarsa dalam 1 jam.`,
        dashboard_link: resetLink,
      },
      {
        publicKey: PUBLIC_KEY,
        privateKey: PRIVATE_KEY,
      }
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}
