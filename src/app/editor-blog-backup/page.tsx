import { createClient } from '@/lib/supabase/server'
import { FileText, Video, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '@/types/database'

export default async function EditorDashboard() {
  const supabase = await createClient()

  // Get stats
  const { count: totalPosts } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })

  const { count: publishedPosts } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentPosts = (data || []) as BlogPost[]

  const stats = [
    {
      label: 'Total Posts',
      value: totalPosts || 0,
      icon: FileText,
      href: '/editor-blog/posts',
      color: 'bg-blue-500',
    },
    {
      label: 'Published',
      value: publishedPosts || 0,
      icon: TrendingUp,
      href: '/editor-blog/posts',
      color: 'bg-green-500',
    },
    {
      label: 'Drafts',
      value: (totalPosts || 0) - (publishedPosts || 0),
      icon: FileText,
      href: '/editor-blog/posts',
      color: 'bg-yellow-500',
    },
    {
      label: 'Videos',
      value: 0,
      icon: Video,
      href: '/editor-blog/videos',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage blog posts, videos, and SEO settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
            <Link
              href="/editor-blog/posts/new"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              + New Post
            </Link>
          </div>
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/editor-blog/posts/${post.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No posts yet</p>
              <Link
                href="/editor-blog/posts/new"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Create your first post
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/editor-blog/posts/new"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="bg-amber-400 w-10 h-10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create New Post</p>
                <p className="text-sm text-gray-600">
                  Write a new blog article
                </p>
              </div>
            </Link>
            <Link
              href="/editor-blog/videos"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="bg-purple-400 w-10 h-10 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Videos</p>
                <p className="text-sm text-gray-600">
                  Update landing page slider
                </p>
              </div>
            </Link>
            <Link
              href="/editor-blog/seo"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="bg-blue-400 w-10 h-10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">SEO Settings</p>
                <p className="text-sm text-gray-600">
                  Configure meta tags and keywords
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
