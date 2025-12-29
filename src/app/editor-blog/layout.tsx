import { Metadata } from 'next'
import { EditorSidebar } from '@/components/editor'

export const metadata: Metadata = {
  title: 'Editor Dashboard - VidiOfficial',
  robots: {
    index: false,
    follow: false,
  },
}

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditorSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
