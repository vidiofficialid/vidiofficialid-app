import Link from 'next/link'
import { RegisterForm } from '@/components/auth'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-black">VidiOfficialID</h1>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-black">
          Buat Akun Baru
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
