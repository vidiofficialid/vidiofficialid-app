import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/SessionProvider"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })

export const metadata: Metadata = {
  title: "VidiOfficialID - Video Testimonials for Small Business",
  description: "Turn real customer stories into simple, powerful videos that help your small business grow.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-white antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
