import { BlogPostForm } from "@/components/blog-management/blog-post-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params
  return <BlogPostForm blogId={id} />
}
