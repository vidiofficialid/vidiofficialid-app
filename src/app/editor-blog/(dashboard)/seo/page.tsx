'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrowserClient } from '@supabase/ssr'

interface SeoSettings {
  title: string
  description: string
  keywords: string
  og_image: string
}

export default function SeoPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    title: '',
    description: '',
    keywords: '',
    og_image: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load settings from database on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_name', 'home')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading SEO settings:', error)
      }

      if (data) {
        setSettings({
          title: data.title || '',
          description: data.description || '',
          keywords: data.keywords || '',
          og_image: data.og_image || '',
        })
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('seo_settings')
        .select('id')
        .eq('page_name', 'home')
        .single()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('seo_settings')
          .update({
            title: settings.title,
            description: settings.description,
            keywords: settings.keywords,
            og_image: settings.og_image,
            updated_at: new Date().toISOString(),
          })
          .eq('page_name', 'home')

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('seo_settings')
          .insert({
            page_name: 'home',
            title: settings.title,
            description: settings.description,
            keywords: settings.keywords,
            og_image: settings.og_image,
          })

        if (error) throw error
      }

      alert('SEO settings saved successfully!')
    } catch (error) {
      console.error('Failed to save SEO settings:', error)
      alert('Failed to save SEO settings. Please try again.')
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
          <Label htmlFor="og_image">Open Graph Image</Label>
          <Input
            id="og_image"
            type="url"
            value={settings.og_image}
            onChange={(e) =>
              setSettings({ ...settings, og_image: e.target.value })
            }
            placeholder="https://example.com/og-image.jpg"
          />
          <p className="text-sm text-gray-500">
            Image displayed when sharing on social media (1200x630px recommended)
          </p>
          {settings.og_image && (
            <div className="mt-2">
              <img 
                src={settings.og_image} 
                alt="OG Image Preview" 
                className="max-w-xs rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
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
