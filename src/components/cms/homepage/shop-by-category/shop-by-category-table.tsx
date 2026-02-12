'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { FolderOpen, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { getCdnUrl } from '@/utils/cdn'
import type { ShopByCategoryItem } from '@/redux/services/cmsService'

interface ShopByCategoryTableProps {
  categories: ShopByCategoryItem[]
  onEdit: (category: ShopByCategoryItem) => void
  onDelete: (categoryId: string) => void
  onToggleStatus: (categoryId: string) => void
}

// Create columns
function createColumns(
  onEdit: (category: ShopByCategoryItem) => void,
  onDelete: (categoryId: string) => void,
  onToggleStatus: (categoryId: string) => void
): ColumnDef<ShopByCategoryItem>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rank" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.rank}</span>
      ),
      size: 70,
    },
    {
      accessorKey: 'image_url',
      header: 'Preview',
      cell: ({ row }) => {
        const category = row.original
        const imageUrl = getCdnUrl(category.image_url)
        if (!imageUrl) {
          return (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              No image
            </div>
          )
        }
        return (
          <img
            src={imageUrl}
            alt={category.image_alt_text || category.title}
            className="h-12 w-12 rounded object-cover"
          />
        )
      },
      enableSorting: false,
      size: 80,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
      size: 150,
    },
    {
      accessorKey: 'redirect_url',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Redirect URL" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm max-w-48 truncate block">
          {row.original.redirect_url || '-'}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
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
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(category.id)}>
                {category.status ? (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
  ]
}

export function ShopByCategoryTable({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
}: ShopByCategoryTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      onDelete(categoryToDelete)
      setCategoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Memoize columns with delete handler wrapper
  const columns = useMemo(
    () => createColumns(onEdit, handleDeleteClick, onToggleStatus),
    [onEdit, onToggleStatus]
  )

  // Sort categories by rank
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.rank - b.rank),
    [categories]
  )

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No categories found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click &quot;Add Category&quot; to create your first category
        </p>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={sortedCategories}
        showPagination={false}
        showToolbar={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
