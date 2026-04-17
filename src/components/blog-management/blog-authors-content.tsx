'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { MediaPickerInput } from '@/components/media'
import { Plus, Loader2, FolderOpen, MoreVertical, Pencil, Trash2, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'
import { getCdnUrl } from '@/utils/cdn'
import blogService, { type BlogAuthor } from './blog-service'
import { usePermissions } from '@/hooks/usePermissions'
import PERMISSIONS from '@/configs/permissions.json'

export function BlogAuthorsContent() {
  const { has } = usePermissions()
  const canRead = has(PERMISSIONS.BLOG_AUTHOR.READ)
  const canCreate = has(PERMISSIONS.BLOG_AUTHOR.CREATE)
  const canUpdate = has(PERMISSIONS.BLOG_AUTHOR.UPDATE)
  const canDelete = has(PERMISSIONS.BLOG_AUTHOR.DELETE)

  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editAuthor, setEditAuthor] = useState<BlogAuthor | null>(null)
  const [deleteAuthor, setDeleteAuthor] = useState<BlogAuthor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [authorStatus, setAuthorStatus] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchAuthors = async () => {
    if (!canRead) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const res = await blogService.listAuthors()
      setAuthors(res.data.data.items)
    } catch {
      toast.error('Failed to fetch authors')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAuthors() }, [canRead])

  const resetForm = () => { setName(''); setBio(''); setAvatarUrl(''); setAuthorStatus(true); setErrors({}) }

  const openAdd = () => { resetForm(); setIsAddOpen(true) }
  const openEdit = (a: BlogAuthor) => {
    setName(a.name); setBio(a.bio || ''); setAvatarUrl(a.avatar_url || ''); setAuthorStatus(a.status); setErrors({})
    setEditAuthor(a)
  }
  const closeDrawer = () => { setIsAddOpen(false); setEditAuthor(null); resetForm() }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      if (editAuthor) {
        const res = await blogService.updateAuthor(editAuthor.id, { name, bio: bio || undefined, avatar_url: avatarUrl || undefined, status: authorStatus })
        toast.success(res.data.message)
        setAuthors((prev) => prev.map((a) => a.id === editAuthor.id ? res.data.data : a))
      } else {
        const res = await blogService.createAuthor({ name, bio: bio || undefined, avatar_url: avatarUrl || undefined, status: authorStatus })
        toast.success(res.data.message)
        setAuthors((prev) => [...prev, res.data.data])
      }
      closeDrawer()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save author')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteAuthor) return
    setIsDeleting(true)
    try {
      await blogService.deleteAuthor(deleteAuthor.id)
      toast.success('Author deleted successfully')
      setAuthors((prev) => prev.filter((a) => a.id !== deleteAuthor.id))
      setDeleteAuthor(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete author')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<BlogAuthor>[] = [
    {
      accessorKey: 'avatar_url',
      header: 'Avatar',
      cell: ({ row }) => {
        const url = getCdnUrl(row.original.avatar_url || '')
        if (!url) return <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><UserCircle className="h-5 w-5 text-muted-foreground" /></div>
        return <img src={url} alt={row.original.name} className="h-10 w-10 rounded-full object-cover" />
      },
      enableSorting: false,
      size: 70,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'bio',
      header: 'Bio',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">{row.original.bio || '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status ? 'default' : 'secondary'}>
          {row.original.status ? 'Active' : 'Inactive'}
        </Badge>
      ),
      size: 90,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpdate && (
              <DropdownMenuItem onClick={() => openEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteAuthor(row.original)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      size: 70,
    },
  ]

  const drawerOpen = isAddOpen || !!editAuthor

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h3 className="text-lg font-medium text-muted-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to view blog authors.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog Authors</h1>
          <p className="text-sm text-muted-foreground">Manage authors for blog posts</p>
        </div>
        {canCreate && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Author
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : authors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No authors yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Click &quot;Add Author&quot; to create your first author</p>
            </div>
          ) : (
            <DataTable columns={columns} data={authors} showToolbar={false} showPagination={false} totalLabel={`${authors.length} author${authors.length !== 1 ? 's' : ''}`} />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Drawer */}
      <Sheet open={drawerOpen} onOpenChange={(open) => { if (!open) closeDrawer() }}>
        <SheetContent className="sm:max-w-md flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader className="px-6 py-4 border-b text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle>{editAuthor ? 'Edit Author' : 'Add Author'}</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input placeholder="Author name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea placeholder="Short author biography..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <MediaPickerInput
              label="Avatar"
              value={avatarUrl || null}
              onChange={(path) => setAvatarUrl(path || '')}
              rootPath="blogs/authors"
            />
            <div className="flex items-center gap-2">
              <Checkbox id="author_status" checked={authorStatus} onCheckedChange={(v) => setAuthorStatus(v === true)} />
              <Label htmlFor="author_status" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
            <Button variant="outline" className="flex-1" onClick={closeDrawer} disabled={isSubmitting}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editAuthor ? 'Save Changes' : 'Create Author'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteAuthor} onOpenChange={(open) => { if (!open) setDeleteAuthor(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteAuthor?.name}&quot;? Authors with existing blog posts cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
