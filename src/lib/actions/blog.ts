'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BlogPost } from '@/types/database'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const image = formData.get('image') as string
  const published = formData.get('published') === 'true'

  const slug = generateSlug(title)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('blog_posts').insert({
    title,
    slug,
    excerpt,
    content,
    image,
    published,
    published_at: published ? new Date().toISOString() : null,
    author_id: user.id,
  })

  if (error) {
    console.error('Failed to create post:', error)
    throw new Error('Failed to create post')
  }

  revalidatePath('/editor-blog/posts')
  revalidatePath('/blog')
  revalidatePath('/')
  redirect('/editor-blog/posts')
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const image = formData.get('image') as string
  const published = formData.get('published') === 'true'

  const slug = generateSlug(title)

  // Check if already published to preserve original publish date
  const { data: existingData } = await supabase
    .from('blog_posts')
    .select('published, published_at')
    .eq('id', postId)
    .single()

  const existingPost = existingData as { published: boolean; published_at: string | null } | null

  const publishedAt = published
    ? existingPost?.published_at || new Date().toISOString()
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('blog_posts')
    .update({
      title,
      slug,
      excerpt,
      content,
      image,
      published,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (error) {
    console.error('Failed to update post:', error)
    throw new Error('Failed to update post')
  }

  revalidatePath('/editor-blog/posts')
  revalidatePath('/blog')
  revalidatePath('/')
  redirect('/editor-blog/posts')
}

export async function togglePostPublish(postId: string, published: boolean) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('blog_posts')
    .update({
      published,
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (error) {
    console.error('Failed to toggle publish:', error)
    throw new Error('Failed to toggle publish status')
  }

  revalidatePath('/editor-blog/posts')
  revalidatePath('/blog')
  revalidatePath('/')
}

export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('blog_posts').delete().eq('id', postId)

  if (error) {
    console.error('Failed to delete post:', error)
    throw new Error('Failed to delete post')
  }

  revalidatePath('/editor-blog/posts')
  revalidatePath('/blog')
  revalidatePath('/')
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    return null
  }

  return data as BlogPost
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (data || []) as BlogPost[]
}
