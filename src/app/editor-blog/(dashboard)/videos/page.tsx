'use client'

import { useState, useEffect } from 'react'
import { Video, Plus, Trash2, GripVertical, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrowserClient } from '@supabase/ssr'

interface VideoItem {
  id: string
  url: string
  title: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newVideo, setNewVideo] = useState({ url: '', title: '' })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load videos from database on mount
  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section_name', 'video_slider')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading videos:', error)
      }

      if (data?.content) {
        const content = data.content as { videos?: VideoItem[] }
        setVideos(content.videos || [])
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVideo = () => {
    if (!newVideo.url.trim()) return

    const id = Date.now().toString()
    setVideos([...videos, { id, ...newVideo }])
    setNewVideo({ url: '', title: '' })
  }

  const handleRemoveVideo = (id: string) => {
    setVideos(videos.filter((v) => v.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('landing_content')
        .select('id')
        .eq('section_name', 'video_slider')
        .single()

      const contentData = { videos }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('landing_content')
          .update({ 
            content: contentData,
            updated_at: new Date().toISOString()
          })
          .eq('section_name', 'video_slider')

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('landing_content')
          .insert({
            section_name: 'video_slider',
            content: contentData
          })

        if (error) throw error
      }

      alert('Videos saved successfully!')
    } catch (error) {
      console.error('Failed to save videos:', error)
      alert('Failed to save videos. Please try again.')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Slider</h1>
        <p className="text-gray-600 mt-1">
          Manage videos displayed on the landing page slider
        </p>
      </div>

      {/* Add New Video */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Video</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://example.com/video.mp4"
              value={newVideo.url}
              onChange={(e) =>
                setNewVideo({ ...newVideo, url: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="videoTitle">Title</Label>
            <Input
              id="videoTitle"
              placeholder="Video title"
              value={newVideo.title}
              onChange={(e) =>
                setNewVideo({ ...newVideo, title: e.target.value })
              }
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddVideo}
              className="bg-amber-400 text-gray-900 hover:bg-amber-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Video
            </Button>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Current Videos</h2>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 text-white hover:bg-gray-800"
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

        {videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <button className="cursor-grab text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {video.title || 'Untitled Video'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{video.url}</p>
                </div>
                <span className="text-sm text-gray-400">#{index + 1}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveVideo(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No videos yet
            </h3>
            <p className="text-gray-500">
              Add videos to display on the landing page slider
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag and drop to reorder videos</li>
          <li>• Supported formats: MP4, WebM</li>
          <li>• Recommended aspect ratio: 16:9</li>
          <li>• Use Cloudinary or similar CDN for video hosting</li>
        </ul>
      </div>
    </div>
  )
}
