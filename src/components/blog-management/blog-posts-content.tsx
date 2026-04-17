'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Loader2, MoreVertical, Pencil, Trash2, FolderOpen, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { getCdnUrl } from '@/utils/cdn'
import blogService, { type Blog } from './blog-service'
import { usePermissions } from '@/hooks/usePermissions'
import PERMISSIONS from '@/configs/permissions.json'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

export function BlogPostsContent() {
  const router = useRouter()
  const { has } = usePermissions()
  const canRead = has(PERMISSIONS.BLOG.READ)
  const canCreate = has(PERMISSIONS.BLOG.CREATE)
  const canUpdate = has(PERMISSIONS.BLOG.UPDATE)
  const canDelete = has(PERMISSIONS.BLOG.DELETE)

  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBlogs = async () => {
    if (!canRead) { setIsLoading(false); return }
    try {
      setIsLoading(true)
      const res = await blogService.listBlogs()
      setBlogs(res.data.data.items)
    } catch {
      toast.error('Failed to fetch blog posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [canRead])

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return
    setIsDeleting(true)
    try {
      await blogService.deleteBlog(blogToDelete.id)
      toast.success('Blog post deleted successfully')
      setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id))
      setDeleteDialogOpen(false)
      setBlogToDelete(null)
    } catch {
      toast.error('Failed to delete blog post')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<Blog>[]>(
    () => [
      {
        accessorKey: 'feature_image_url',
        header: 'Image',
        cell: ({ row }) => {
          const url = getCdnUrl(row.original.feature_image_url || '')
          if (!url) return <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">No image</div>
          return <img src={url} alt={row.original.feature_image_alt || ''} className="h-10 w-16 rounded object-cover" />
        },
        enableSorting: false,
        size: 90,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-sm">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.slug}</p>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: 'category_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.category_name || <span className="text-muted-foreground">—</span>}</span>
        ),
        size: 140,
      },
      {
        accessorKey: 'author_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.author_name || <span className="text-muted-foreground">—</span>}</span>
        ),
        size: 140,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const s = row.original.status
          if (s === 'published') return <Badge variant="default">Published</Badge>
          if (s === 'scheduled') return (
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
              <Clock className="mr-1 h-3 w-3" />Scheduled
            </Badge>
          )
          return <Badge variant="secondary">Draft</Badge>
        },
        size: 100,
      },
      {
        accessorKey: 'published_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Published" sortable />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.published_at ? formatDate(row.original.published_at) : '—'}
          </span>
        ),
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const blog = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdate && (
                  <DropdownMenuItem onClick={() => router.push(`/blog-management/posts/${blog.id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => { setBlogToDelete(blog); setDeleteDialogOpen(true) }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
        size: 70,
      },
    ],
    [router]
  )

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h3 className="text-lg font-medium text-muted-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to view blog posts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">Manage blog posts for the storefront</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push('/blog-management/posts/create')}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No blog posts yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Click &quot;New Post&quot; to create your first blog post</p>
            </div>
          ) : (
            <DataTable columns={columns} data={blogs} showToolbar={false} totalLabel={`${blogs.length} post${blogs.length !== 1 ? 's' : ''}`} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{blogToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
