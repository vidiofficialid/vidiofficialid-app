import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Security Headers - Fixes for pentest vulnerabilities
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            // Prevents clickjacking attacks
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Prevents MIME type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // XSS Protection (legacy but still useful)
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            // Controls referrer information
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restricts browser features
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            // HTTP Strict Transport Security (HSTS)
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            // Content Security Policy
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.ywxi.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com wss://*.supabase.co https://*.ywxi.net https://s3-us-west-2.amazonaws.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "media-src 'self' blob: https://res.cloudinary.com",
              "object-src 'none'",
            ].join("; "),
          },
          {
            // Prevent server information disclosure
            key: "X-Powered-By",
            value: "",
          },
        ],
      },
    ];
  },

  // Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
