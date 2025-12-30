'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { togglePostPublish, deletePost } from '@/lib/actions/blog'

export function TogglePublishButton({
  postId,
  isPublished,
}: {
  postId: string
  isPublished: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    try {
      await togglePostPublish(postId, !isPublished)
      router.refresh()
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9"
      onClick={handleToggle}
      disabled={loading}
      title={isPublished ? 'Unpublish' : 'Publish'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPublished ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </Button>
  )
}

export function DeletePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setLoading(true)
    try {
      await deletePost(postId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete post:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  )
}
