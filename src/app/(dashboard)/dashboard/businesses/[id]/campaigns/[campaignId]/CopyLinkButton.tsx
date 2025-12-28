"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert("Gagal menyalin link")
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" /> Tersalin!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" /> Salin
        </>
      )}
    </button>
  )
}
