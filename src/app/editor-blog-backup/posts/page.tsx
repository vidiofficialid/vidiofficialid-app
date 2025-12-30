import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeletePostButton, TogglePublishButton } from './PostActions'
import type { BlogPost } from '@/types/database'

export default async function BlogPostsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const posts = (data || []) as BlogPost[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">
            Manage your blog articles
          </p>
        </div>
        <Link href="/editor-blog/posts/new">
          <Button className="bg-amber-400 text-gray-900 hover:bg-amber-500">
            <Plus className="w-5 h-5 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {posts && posts.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                  Post
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={64}
                          height={48}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {post.excerpt || 'No excerpt'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {post.published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(post.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <TogglePublishButton
                        postId={post.id}
                        isPublished={post.published}
                      />
                      <Link href={`/editor-blog/posts/${post.slug}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first blog post
            </p>
            <Link href="/editor-blog/posts/new">
              <Button className="bg-amber-400 text-gray-900 hover:bg-amber-500">
                <Plus className="w-5 h-5 mr-2" />
                Create First Post
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
