import { Resend } from 'resend'

// Lazy initialization to prevent build-time errors
let resendClient: Resend | null = null

// Get a valid from email address
function getFromEmail(): string {
  let fromEmail = process.env.RESEND_FROM_EMAIL

  // Clean up quotes if present (common mistake in env vars)
  if (fromEmail) {
    fromEmail = fromEmail.replace(/^["']|["']$/g, '')
  }

  // If RESEND_FROM_EMAIL is set and looks valid, use it
  if (fromEmail && (fromEmail.includes('@') || fromEmail.includes('<'))) {
    return fromEmail
  }

  // Fallback to Resend's testing domain (works without domain verification)
  return 'VidiOfficial <onboarding@resend.dev>'
}

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured')
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResendClient()

  if (!resend) {
    console.log('Email service not configured, skipping welcome email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Selamat Datang di VidiOfficialID! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000; margin: 0; font-size: 28px;">VidiOfficialID</h1>
              </div>
              
              <h2 style="color: #333; margin-bottom: 20px;">Hai ${name}! 👋</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Terima kasih sudah mendaftar di <strong>VidiOfficialID</strong>! 
                Kami senang kamu bergabung dengan kami.
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Dengan VidiOfficialID, kamu bisa mengumpulkan video testimonial dari 
                pelanggan dengan mudah dan meningkatkan kepercayaan bisnis kamu.
              </p>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vidi.official.id'}/dashboard" 
                   style="display: inline-block; background: #FDC435; color: #000; padding: 14px 32px; 
                          border-radius: 50px; text-decoration: none; font-weight: 600;">
                  Mulai Sekarang
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center;">
                Butuh bantuan? Balas email ini dan kami akan dengan senang hati membantu.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} VidiOfficialID. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const resend = getResendClient()

  if (!resend) {
    console.log('Email service not configured, skipping password reset email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Reset Password - VidiOfficialID',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000; margin: 0; font-size: 28px;">VidiOfficialID</h1>
              </div>
              
              <h2 style="color: #333; margin-bottom: 20px;">Reset Password</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Kamu meminta untuk reset password. Klik tombol di bawah untuk membuat password baru.
              </p>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resetLink}" 
                   style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; 
                          border-radius: 50px; text-decoration: none; font-weight: 600;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px;">
                Jika kamu tidak meminta reset password, abaikan email ini.
                Link ini akan expired dalam 1 jam.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send password reset email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendInvitationEmail(
  email: string,
  customerName: string,
  brandName: string,
  recordUrl: string
) {
  const resend = getResendClient()

  if (!resend) {
    console.log('Email service not configured, skipping invitation email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Undangan Video Testimoni untuk ${brandName} 🎬`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000; margin: 0; font-size: 28px;">VidiOfficialID</h1>
              </div>
              
              <h2 style="color: #333; margin-bottom: 20px;">Halo ${customerName}! 👋</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Anda diundang untuk memberikan <strong>video testimoni</strong> untuk 
                <strong>${brandName}</strong>.
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Kami sangat menghargai pengalaman Anda dan ingin mendengar cerita Anda. 
                Proses rekaman hanya membutuhkan beberapa menit.
              </p>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${recordUrl}" 
                   style="display: inline-block; background: #FDC435; color: #000; padding: 14px 32px; 
                          border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  🎬 Rekam Testimoni Sekarang
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center; margin-bottom: 20px;">
                Atau klik link berikut:<br>
                <a href="${recordUrl}" style="color: #2563eb; word-break: break-all;">${recordUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 14px; text-align: center;">
                Terima kasih atas waktu dan kepercayaan Anda! 🙏
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} VidiOfficialID. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send invitation email:', error)
      return { success: false, error: error.message }
    }

    console.log('Invitation email sent successfully to:', email)
    return { success: true }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
