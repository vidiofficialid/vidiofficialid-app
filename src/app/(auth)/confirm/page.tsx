import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = params.email || 'your email'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-black">VidiOfficialID</h1>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-black mb-4">
            Registration Successful! 🎉
          </h2>
          
          <p className="text-gray-600 mb-2">
            Your account has been created with email:
          </p>
          
          <p className="text-black font-semibold mb-6">
            {email}
          </p>
          
          <p className="text-gray-500 text-sm mb-8">
            You can now access all features to collect video testimonials from your customers.
          </p>
          
          <Link href="/dashboard">
            <Button className="w-full" size="lg">
              Continue to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
