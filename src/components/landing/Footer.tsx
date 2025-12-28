"use client"

import Image from "next/image"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-[#FDC435] rounded-t-[80px] py-12 md:py-16 px-4 md:px-6 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto text-center">
        {/* Logo */}
        <Link href="/" className="inline-block mb-6 md:mb-8">
          <Image 
            src="/logo.svg" 
            alt="vidiofficial logo" 
            width={96}
            height={96}
            className="w-20 h-20 md:w-24 md:h-24 object-contain mx-auto hover:scale-105 transition-transform"
          />
        </Link>

        {/* Links */}
        <div className="flex justify-center gap-6 mb-6 text-sm font-medium">
          <Link href="/about" className="text-black hover:text-gray-700 transition-colors">
            About
          </Link>
          <Link href="/blog" className="text-black hover:text-gray-700 transition-colors">
            Blog
          </Link>
          <Link href="/privacy" className="text-black hover:text-gray-700 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-black hover:text-gray-700 transition-colors">
            Terms
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-black text-sm">
          © {currentYear} vidiofficialid. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
