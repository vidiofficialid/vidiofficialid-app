'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SeoSettings {
  title: string
  description: string
  keywords: string
  ogImage: string
}

export default function SeoPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    title: 'VidiOfficial - Video Testimonial Platform',
    description:
      'Collect authentic video testimonials from your customers with ease. The simple way to grow your business with real customer stories.',
    keywords:
      'video testimonial, testimonial platform, customer reviews, UMKM, small business',
    ogImage: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Load settings from Supabase
    setLoading(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Save to Supabase seo_settings table
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('SEO settings saved successfully!')
    } catch (error) {
      console.error('Failed to save SEO settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure meta tags for search engines
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-400 text-gray-900 hover:bg-amber-500"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Landing Page SEO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-400 w-10 h-10 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Landing Page</h2>
            <p className="text-sm text-gray-500">Homepage meta tags</p>
          </div>
        </div>

        {/* Meta Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Meta Title</Label>
          <Input
            id="title"
            value={settings.title}
            onChange={(e) =>
              setSettings({ ...settings, title: e.target.value })
            }
            placeholder="Page title for search engines"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Recommended: 50-60 characters
            </span>
            <span
              className={
                settings.title.length > 60 ? 'text-red-500' : 'text-gray-500'
              }
            >
              {settings.title.length}/60
            </span>
          </div>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Meta Description</Label>
          <textarea
            id="description"
            value={settings.description}
            onChange={(e) =>
              setSettings({ ...settings, description: e.target.value })
            }
            placeholder="Brief description for search results"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Recommended: 150-160 characters
            </span>
            <span
              className={
                settings.description.length > 160
                  ? 'text-red-500'
                  : 'text-gray-500'
              }
            >
              {settings.description.length}/160
            </span>
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            value={settings.keywords}
            onChange={(e) =>
              setSettings({ ...settings, keywords: e.target.value })
            }
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-sm text-gray-500">
            Separate keywords with commas
          </p>
        </div>

        {/* OG Image */}
        <div className="space-y-2">
          <Label htmlFor="ogImage">Open Graph Image</Label>
          <Input
            id="ogImage"
            type="url"
            value={settings.ogImage}
            onChange={(e) =>
              setSettings({ ...settings, ogImage: e.target.value })
            }
            placeholder="https://example.com/og-image.jpg"
          />
          <p className="text-sm text-gray-500">
            Image displayed when sharing on social media (1200x630px recommended)
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Search Result Preview
        </h2>
        <div className="border rounded-lg p-4 max-w-xl">
          <p className="text-blue-800 text-lg hover:underline cursor-pointer line-clamp-1">
            {settings.title || 'Page Title'}
          </p>
          <p className="text-green-700 text-sm">https://vidi.official.id</p>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {settings.description || 'Page description will appear here...'}
          </p>
        </div>
      </div>
    </div>
  )
}
