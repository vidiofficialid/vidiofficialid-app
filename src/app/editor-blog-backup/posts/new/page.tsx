'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPost } from '@/lib/actions/blog'

export default function NewPostPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await createPost(formData)
    } catch (error) {
      console.error('Failed to create post:', error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/editor-blog/posts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600 mt-1">Write a new blog article</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter post title"
              required
              className="text-lg"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" variant="outline" size="icon">
                <ImagePlus className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Enter a URL for the featured image
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              placeholder="Brief description of the post..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <textarea
              id="content"
              name="content"
              rows={15}
              placeholder="Write your article content here... (Supports Markdown)"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-y font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Supports Markdown formatting
            </p>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              value="true"
              className="w-5 h-5 rounded border-gray-300 text-amber-400 focus:ring-amber-400"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Publish immediately
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/editor-blog/posts">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-400 text-gray-900 hover:bg-amber-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Post
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
