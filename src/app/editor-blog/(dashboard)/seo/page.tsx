'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Globe, Upload, ImageIcon, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'

interface SeoSettings {
  title: string
  description: string
  keywords: string
  og_image: string
  twitter_image: string
  og_image_custom_mode: boolean
  twitter_image_custom_mode: boolean
  // Temporary file holders for upload
  ogImageFile?: File | null
  twitterImageFile?: File | null
}

export default function SeoPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    twitter_image: '',
    og_image_custom_mode: false,
    twitter_image_custom_mode: false,
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
          twitter_image: data.twitter_image || '',
          og_image_custom_mode: data.og_image_custom_mode || false,
          twitter_image_custom_mode: data.twitter_image_custom_mode || false,
        })
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'vidi_unsigned')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleImageUpload = (
    field: 'og_image' | 'twitter_image',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings((prev) => ({
          ...prev,
          [field]: reader.result as string, // Preview
          [field === 'og_image' ? 'ogImageFile' : 'twitterImageFile']: file,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let ogImageUrl = settings.og_image
      let twitterImageUrl = settings.twitter_image

      // Upload new files if they exist
      if (settings.ogImageFile) {
        ogImageUrl = await uploadToCloudinary(settings.ogImageFile)
      }
      if (settings.twitterImageFile) {
        twitterImageUrl = await uploadToCloudinary(settings.twitterImageFile)
      }

      // Check if record exists
      const { data: existing } = await supabase
        .from('seo_settings')
        .select('id')
        .eq('page_name', 'home')
        .single()

      const payload = {
        title: settings.title,
        description: settings.description,
        keywords: settings.keywords,
        og_image: ogImageUrl,
        twitter_image: twitterImageUrl,
        og_image_custom_mode: settings.og_image_custom_mode,
        twitter_image_custom_mode: settings.twitter_image_custom_mode,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('seo_settings')
          .update(payload)
          .eq('page_name', 'home')

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('seo_settings')
          .insert({
            page_name: 'home',
            ...payload
          })

        if (error) throw error
      }

      // Update state to reflect uploaded URLs (and clear file objects)
      setSettings(prev => ({
        ...prev,
        og_image: ogImageUrl,
        twitter_image: twitterImageUrl,
        ogImageFile: undefined,
        twitterImageFile: undefined,
      }))

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
            Configure meta tags and social preview images
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Landing Page Meta */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-400 w-10 h-10 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Landing Page Metadata</h2>
                <p className="text-sm text-gray-500">Search engine appearance</p>
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
                <span className="text-gray-500">Recommended: 50-60 chars</span>
                <span className={settings.title.length > 60 ? 'text-red-500' : 'text-gray-500'}>
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
                <span className="text-gray-500">Recommended: 150-160 chars</span>
                <span className={settings.description.length > 160 ? 'text-red-500' : 'text-gray-500'}>
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
                placeholder="video testimonial, umkm, review bisnis"
              />
              <p className="text-sm text-gray-500">
                Separate keywords with commas
              </p>
            </div>
          </div>

          {/* Social Media Images */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Social Media Preview</h2>

              {/* Open Graph Image */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Open Graph Image (Facebook/LinkedIn)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{settings.og_image_custom_mode ? 'Custom Image' : 'Default Generated'}</span>
                    <Switch
                      checked={settings.og_image_custom_mode}
                      onCheckedChange={(checked) => setSettings({ ...settings, og_image_custom_mode: checked })}
                    />
                  </div>
                </div>

                {settings.og_image_custom_mode && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {settings.og_image ? (
                          <img
                            src={settings.og_image}
                            alt="OG Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-2">
                          <label className="cursor-pointer inline-flex">
                            <div className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                              <Upload className="w-4 h-4" />
                              Upload Custom Image
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload('og_image', e)}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500">Recommended: 1200x630px JPG/PNG</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Twitter Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Twitter Card Image</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{settings.twitter_image_custom_mode ? 'Custom Image' : 'Default Generated'}</span>
                    <Switch
                      checked={settings.twitter_image_custom_mode}
                      onCheckedChange={(checked) => setSettings({ ...settings, twitter_image_custom_mode: checked })}
                    />
                  </div>
                </div>

                {settings.twitter_image_custom_mode && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {settings.twitter_image ? (
                          <img
                            src={settings.twitter_image}
                            alt="Twitter Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Twitter className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-2">
                          <label className="cursor-pointer inline-flex">
                            <div className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                              <Upload className="w-4 h-4" />
                              Upload Custom Image
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload('twitter_image', e)}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500">Recommended: 1200x600px JPG/PNG</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Google Search Preview
            </h2>
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <img src="/favicon.ico" className="w-4 h-4" alt="" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="text-sm">
                  <div className="text-gray-800 font-medium">VidiOfficialID</div>
                  <div className="text-gray-500 text-xs">https://vidi.official.id</div>
                </div>
              </div>
              <p className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer line-clamp-1 mb-1">
                {settings.title || 'VidiOfficialID - Layanan Video Testimonial'}
              </p>
              <p className="text-gray-600 text-sm line-clamp-2">
                {settings.description || 'vidi.official.id solusi untuk usaha Anda mendapatkan video testimonial dari konsumen. Dengan teknologi aplikasi website terkini...'}
              </p>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Helpful Tips</h3>
              <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4">
                <li>Use high-quality images for social sharing to increase engagement.</li>
                <li>Include target keywords in your title and description naturally.</li>
                <li>Keep titles under 60 characters to avoid truncation.</li>
                <li>Toggle "Default Generated" if you want to revert to automatic OpenGraph images.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
