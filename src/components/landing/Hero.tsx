"use client"

import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative bg-[#FDC435] pt-6 pb-40 md:pb-48 px-4 md:px-6 rounded-b-[80px]">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <Link href="/about">
          <button className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors">
            About Us
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors">
            Login
          </button>
        </Link>
      </nav>

      {/* Logo */}
      <div className="max-w-7xl mx-auto flex justify-center mb-12">
        <Image 
          src="/logo.svg" 
          alt="vidiofficial logo" 
          width={128}
          height={128}
          className="w-28 h-28 md:w-32 md:h-32 object-contain"
          priority
        />
      </div>

      {/* Headline */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
          Turn real customer stories into simple, powerful videos that help your small business grow.
        </h1>
      </div>

      {/* CTA Button */}
      <div className="max-w-7xl mx-auto flex justify-center">
        <Link href="/register">
          <button className="bg-black text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-gray-800 transition-colors">
            Start for Free
          </button>
        </Link>
      </div>
    </section>
  )
}
