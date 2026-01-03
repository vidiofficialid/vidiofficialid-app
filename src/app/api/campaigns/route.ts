import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Extract public_id from Cloudinary URL
function extractCloudinaryId(url: string): string | null {
    try {
        // URL format: https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.ext
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
        return match ? match[1] : null
    } catch {
        return null
    }
}

// Delete image from Cloudinary
async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Cloudinary credentials not configured')
            return false
        }

        // Create signature for deletion
        const timestamp = Math.floor(Date.now() / 1000)
        const crypto = await import('crypto')
        const signature = crypto
            .createHash('sha1')
            .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
            .digest('hex')

        const formData = new FormData()
        formData.append('public_id', publicId)
        formData.append('signature', signature)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            {
                method: 'POST',
                body: formData,
            }
        )

        const result = await response.json()
        console.log('Cloudinary delete result:', result)
        return result.result === 'ok'
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error)
        return false
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { campaignId } = await request.json()

        if (!campaignId) {
            return NextResponse.json(
                { error: 'Campaign ID is required' },
                { status: 400 }
            )
        }

        // Create Supabase client with service role for deletion
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Database configuration missing' },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get campaign data first to get the product_image URL
        const { data: campaign, error: fetchError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single()

        if (fetchError) {
            console.error('Error fetching campaign:', fetchError)
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            )
        }

        // Delete product image from Cloudinary if exists
        if (campaign.product_image) {
            const publicId = extractCloudinaryId(campaign.product_image)
            if (publicId) {
                await deleteFromCloudinary(publicId)
            }
        }

        // Delete campaign from database
        const { error: deleteError } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', campaignId)

        if (deleteError) {
            console.error('Error deleting campaign:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete campaign: ' + deleteError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Campaign deleted successfully'
        })

    } catch (error) {
        console.error('Error in delete campaign API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { campaignId, title, brandName, customerName, customerEmail, customerWhatsapp, inviteMethod, testimonialScript, gestureGuide } = body

        if (!campaignId) {
            return NextResponse.json(
                { error: 'Campaign ID is required' },
                { status: 400 }
            )
        }

        // Create Supabase client with service role
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Database configuration missing' },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {}
        if (title !== undefined) updateData.title = title
        if (brandName !== undefined) updateData.brand_name = brandName
        if (customerName !== undefined) updateData.customer_name = customerName
        if (customerEmail !== undefined) updateData.customer_email = customerEmail
        if (customerWhatsapp !== undefined) updateData.customer_whatsapp = customerWhatsapp
        if (inviteMethod !== undefined) updateData.invite_method = inviteMethod
        if (testimonialScript !== undefined) updateData.testimonial_script = testimonialScript
        if (gestureGuide !== undefined) updateData.gesture_guide = gestureGuide

        // Update campaign
        const { data, error } = await supabase
            .from('campaigns')
            .update(updateData)
            .eq('id', campaignId)
            .select()
            .single()

        if (error) {
            console.error('Error updating campaign:', error)
            return NextResponse.json(
                { error: 'Failed to update campaign: ' + error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            campaign: data
        })

    } catch (error) {
        console.error('Error in update campaign API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
