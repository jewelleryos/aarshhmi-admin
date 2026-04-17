'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Plus, Loader2, FolderOpen, MoreVertical, Pencil, Trash2, FolderTree } from 'lucide-react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'
import blogService, { type BlogCategory } from './blog-service'
import { usePermissions } from '@/hooks/usePermissions'
import PERMISSIONS from '@/configs/permissions.json'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export function BlogCategoriesContent() {
  const { has } = usePermissions()
  const canRead = has(PERMISSIONS.BLOG_CATEGORY.READ)
  const canCreate = has(PERMISSIONS.BLOG_CATEGORY.CREATE)
  const canUpdate = has(PERMISSIONS.BLOG_CATEGORY.UPDATE)
  const canDelete = has(PERMISSIONS.BLOG_CATEGORY.DELETE)

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<BlogCategory | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<BlogCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [catStatus, setCatStatus] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchCategories = async () => {
    if (!canRead) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const res = await blogService.listCategories()
      setCategories(res.data.data.items)
    } catch {
      toast.error('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [canRead])

  const resetForm = () => {
    setName(''); setSlug(''); setSlugManual(false); setDescription(''); setCatStatus(true); setErrors({})
  }

  const openAdd = () => { resetForm(); setIsAddOpen(true) }
  const openEdit = (cat: BlogCategory) => {
    setName(cat.name); setSlug(cat.slug); setSlugManual(true); setDescription(cat.description || ''); setCatStatus(cat.status); setErrors({})
    setEditCategory(cat)
  }
  const closeDrawer = () => { setIsAddOpen(false); setEditCategory(null); resetForm() }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slugManual) setSlug(slugify(val))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!slug.trim()) errs.slug = 'Slug is required'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      if (editCategory) {
        const res = await blogService.updateCategory(editCategory.id, { name, slug, description: description || undefined, status: catStatus })
        toast.success(res.data.message)
        setCategories((prev) => prev.map((c) => c.id === editCategory.id ? res.data.data : c))
      } else {
        const res = await blogService.createCategory({ name, slug, description: description || undefined, status: catStatus })
        toast.success(res.data.message)
        setCategories((prev) => [...prev, res.data.data])
      }
      closeDrawer()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCategory) return
    setIsDeleting(true)
    try {
      await blogService.deleteCategory(deleteCategory.id)
      toast.success('Category deleted successfully')
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategory.id))
      setDeleteCategory(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete category')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<BlogCategory>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground font-mono">{row.original.slug}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description || '—'}</span>,
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
                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteCategory(row.original)}>
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

  const drawerOpen = isAddOpen || !!editCategory

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h3 className="text-lg font-medium text-muted-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to view blog categories.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog Categories</h1>
          <p className="text-sm text-muted-foreground">Manage categories for blog posts</p>
        </div>
        {canCreate && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No categories yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Click &quot;Add Category&quot; to create your first category</p>
            </div>
          ) : (
            <DataTable columns={columns} data={categories} showToolbar={false} showPagination={false} totalLabel={`${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`} />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Drawer */}
      <Sheet open={drawerOpen} onOpenChange={(open) => { if (!open) closeDrawer() }}>
        <SheetContent className="sm:max-w-md flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader className="px-6 py-4 border-b text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle>{editCategory ? 'Edit Category' : 'Add Category'}</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Jewellery Tips" value={name} onChange={(e) => handleNameChange(e.target.value)} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Slug <span className="text-destructive">*</span></Label>
              <Input placeholder="jewellery-tips" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }} />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cat_status" checked={catStatus} onCheckedChange={(v) => setCatStatus(v === true)} />
              <Label htmlFor="cat_status" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
            <Button variant="outline" className="flex-1" onClick={closeDrawer} disabled={isSubmitting}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteCategory} onOpenChange={(open) => { if (!open) setDeleteCategory(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteCategory?.name}&quot;? This cannot be undone. Categories with existing blog posts cannot be deleted.
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
