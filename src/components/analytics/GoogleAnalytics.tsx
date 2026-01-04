'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// GA4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}

// Track page views
function usePageTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag === 'undefined') return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Send page view to GA4
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title,
    })
    
    console.log(`[GA4] Page view: ${url}`)
  }, [pathname, searchParams])
}

// Component untuk tracking (wrapped in Suspense)
function PageTracker() {
  usePageTracking()
  return null
}

// Main Google Analytics Component
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('[GA4] Missing NEXT_PUBLIC_GA_MEASUREMENT_ID')
    return null
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
      {/* Page View Tracker */}
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
    </>
  )
}

// ============================================
// UTILITY FUNCTIONS untuk Custom Event Tracking
// ============================================

// Track custom events
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag === 'undefined') {
    console.warn('[GA4] Cannot track event - gtag not available')
    return
  }

  window.gtag('event', eventName, eventParams)
  console.log(`[GA4] Event: ${eventName}`, eventParams)
}

// Pre-defined tracking functions
export const analytics = {
  // Track button clicks
  trackButtonClick: (buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      location: location || 'unknown',
    })
  },

  // Track login button click (specific untuk requirement)
  trackLoginClick: (source: string = 'landing_page') => {
    trackEvent('login_click', {
      source: source,
      page_location: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  },

  // Track signup button click
  trackSignupClick: (source: string = 'landing_page') => {
    trackEvent('signup_click', {
      source: source,
      page_location: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  },

  // Track CTA button click
  trackCTAClick: (ctaName: string, ctaLocation: string) => {
    trackEvent('cta_click', {
      cta_name: ctaName,
      cta_location: ctaLocation,
    })
  },

  // Track navigation
  trackNavigation: (from: string, to: string) => {
    trackEvent('navigation', {
      from_page: from,
      to_page: to,
    })
  },

  // Track video testimonial events
  trackTestimonialCreated: (campaignId: string) => {
    trackEvent('testimonial_created', {
      campaign_id: campaignId,
    })
  },

  // Track campaign events
  trackCampaignCreated: (businessName: string) => {
    trackEvent('campaign_created', {
      business_name: businessName,
    })
  },

  // Track form submissions
  trackFormSubmit: (formName: string, success: boolean) => {
    trackEvent('form_submit', {
      form_name: formName,
      success: success,
    })
  },

  // Track AI script generation
  trackAIScriptGenerated: (duration: number, style: string) => {
    trackEvent('ai_script_generated', {
      script_duration: duration,
      script_style: style,
    })
  },
}

export default GoogleAnalytics
