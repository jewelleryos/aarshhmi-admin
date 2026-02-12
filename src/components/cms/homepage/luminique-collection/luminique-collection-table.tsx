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
import type { LuminiqueCollectionItem } from '@/redux/services/cmsService'

interface LuminiqueCollectionTableProps {
  items: LuminiqueCollectionItem[]
  onEdit: (item: LuminiqueCollectionItem) => void
  onDelete: (itemId: string) => void
  onToggleStatus: (itemId: string) => void
}

// Create columns
function createColumns(
  onEdit: (item: LuminiqueCollectionItem) => void,
  onDelete: (itemId: string) => void,
  onToggleStatus: (itemId: string) => void
): ColumnDef<LuminiqueCollectionItem>[] {
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
        const item = row.original
        const imageUrl = getCdnUrl(item.image_url)
        if (!imageUrl) {
          return (
            <div className="flex h-12 w-20 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              No image
            </div>
          )
        }
        return (
          <img
            src={imageUrl}
            alt={item.image_alt_text || 'Collection item'}
            className="h-12 w-20 rounded object-cover"
          />
        )
      },
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: 'image_alt_text',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alt Text" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm max-w-48 truncate block">
          {row.original.image_alt_text || '-'}
        </span>
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
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(item.id)}>
                {item.status ? (
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
                onClick={() => onDelete(item.id)}
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

export function LuminiqueCollectionTable({
  items,
  onEdit,
  onDelete,
  onToggleStatus,
}: LuminiqueCollectionTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete)
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Memoize columns with delete handler wrapper
  const columns = useMemo(
    () => createColumns(onEdit, handleDeleteClick, onToggleStatus),
    [onEdit, onToggleStatus]
  )

  // Sort items by rank
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.rank - b.rank),
    [items]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No items found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click &quot;Add Item&quot; to create your first collection item
        </p>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={sortedItems}
        showPagination={false}
        showToolbar={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
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
