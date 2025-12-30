'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Video,
  Settings,
  LogOut,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { editorSignOut } from '@/lib/actions/editor-auth'

const navItems = [
  {
    label: 'Dashboard',
    href: '/editor-blog',
    icon: LayoutDashboard,
  },
  {
    label: 'Blog Posts',
    href: '/editor-blog/posts',
    icon: FileText,
  },
  {
    label: 'Video Slider',
    href: '/editor-blog/videos',
    icon: Video,
  },
  {
    label: 'SEO Settings',
    href: '/editor-blog/seo',
    icon: Settings,
  },
]

export function EditorSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await editorSignOut()
    router.push('/editor-blog/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-gray-800 px-4">
          <Image
            src="/logo.svg"
            alt="VidiOfficial"
            width={140}
            height={40}
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/editor-blog' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-400 text-gray-900'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
