'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex justify-center"
                >
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative w-32 h-32 md:w-40 md:h-40"
                    >
                        <Image
                            src="https://res.cloudinary.com/dsv8iy2la/image/upload/v1766922503/logo_k0q2cc.png"
                            alt="VidiOfficialID Logo"
                            fill
                            className="object-contain drop-shadow-xl"
                            priority
                        />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h1 className="text-9xl font-bold text-orange-500/20 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 select-none blur-sm">
                        404
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative z-10">
                        Ups! Halaman Hilang
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto relative z-10">
                        Sepertinya halaman yang kamu cari sudah pindah atau tidak pernah ada. Jangan khawatir, mari kita kembali visual jalurnya.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-xl border-2 border-orange-100 text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-200 transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </button>

                    <Link
                        href="/dashboard"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Ke Dashboard
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-gray-400 text-sm"
                >
                    © {new Date().getFullYear()} VidiOfficialID
                </motion.div>
            </div>
        </div>
    )
}
