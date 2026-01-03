import { NextRequest, NextResponse } from 'next/server'
import { sendInvitationEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const { email, customerName, brandName, recordUrl } = await request.json()

        // Validate required fields
        if (!email || !customerName || !brandName || !recordUrl) {
            return NextResponse.json(
                { error: 'Missing required fields: email, customerName, brandName, recordUrl' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Send invitation email
        const result = await sendInvitationEmail(email, customerName, brandName, recordUrl)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to send invitation email' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Invitation email sent successfully'
        })

    } catch (error) {
        console.error('Error in send-invitation API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
