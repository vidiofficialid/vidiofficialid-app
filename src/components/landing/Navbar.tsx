'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analytics } from '@/components/analytics/GoogleAnalytics'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#blog', label: 'Blog' },
  ]

  // Track login button click
  const handleLoginClick = () => {
    analytics.trackLoginClick('navbar')
  }

  // Track signup/register button click
  const handleSignupClick = () => {
    analytics.trackSignupClick('navbar')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-gray-900 shadow-lg">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="VidiOfficial"
              width={150}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-900 hover:text-amber-400 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" onClick={handleLoginClick}>
              <Button
                variant="ghost"
                className="text-gray-900 hover:text-amber-400 min-h-[44px] min-w-[44px]"
                aria-label="Login to your account"
              >
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={handleSignupClick}>
              <Button
                className="bg-gray-900 text-white px-6 py-3 hover:bg-amber-400 hover:text-gray-900 shadow-lg min-h-[44px]"
                aria-label="Get Started - Create your account"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t-2 border-gray-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 hover:text-amber-400 transition-colors py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-gray-200" />
              <Link href="/login" onClick={() => { setIsOpen(false); handleLoginClick(); }}>
                <Button variant="ghost" className="w-full justify-start text-gray-900 hover:text-amber-400">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => { setIsOpen(false); handleSignupClick(); }}>
                <Button className="w-full bg-gray-900 text-white hover:bg-amber-400 hover:text-gray-900">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
