import { Metadata } from 'next'

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
  return <>{children}</>
}
