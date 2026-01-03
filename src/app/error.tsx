'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RotateCcw, Home, AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="relative w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-dashed border-red-200 rounded-full"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Terjadi Kesalahan
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Maaf, kami mengalami masalah saat memproses permintaan Anda. Tim teknis kami telah dinotifikasi.
                    </p>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left max-w-sm mx-auto overflow-hidden">
                        <p className="text-xs text-red-800 font-mono break-all">
                            Code: {error.digest || 'UNKNOWN_ERROR'}
                            <br />
                            Msg: {error.message || 'Something went wrong'}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={reset}
                        className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Coba Lagi
                    </button>

                    <Link
                        href="/dashboard"
                        className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Ke Dashboard
                    </Link>
                </motion.div>

                <div className="mt-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <Image
                        src="https://res.cloudinary.com/dsv8iy2la/image/upload/v1766922503/logo_k0q2cc.png"
                        alt="VidiOfficialID"
                        width={40}
                        height={40}
                        className="mx-auto"
                    />
                </div>
            </div>
        </div>
    )
}
