import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">VidiOfficialID</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
          Turn real customer stories into{' '}
          <span className="text-[#FDC435]">powerful videos</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Collect authentic video testimonials from your customers and grow your small business.
        </p>
        <Link href="/register">
          <Button size="xl" variant="secondary">
            Mulai Gratis
          </Button>
        </Link>
      </main>
    </div>
  )
}
