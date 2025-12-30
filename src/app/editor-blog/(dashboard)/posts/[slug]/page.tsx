import { notFound } from 'next/navigation'
import { getPost } from '@/lib/actions/blog'
import { EditPostForm } from './EditPostForm'

interface EditPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EditPostForm post={post} />
    </div>
  )
}
