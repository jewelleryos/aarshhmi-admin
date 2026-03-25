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
import type { ShopByShapeItem } from '@/components/cms/services/cmsService'

interface ShopByShapeTableProps {
  shapes: ShopByShapeItem[]
  onEdit: (shape: ShopByShapeItem) => void
  onDelete: (shapeId: string) => void
  onToggleStatus: (shapeId: string) => void
}

function createColumns(
  onEdit: (shape: ShopByShapeItem) => void,
  onDelete: (shapeId: string) => void,
  onToggleStatus: (shapeId: string) => void
): ColumnDef<ShopByShapeItem>[] {
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
        const shape = row.original
        const imageUrl = getCdnUrl(shape.image_url)
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
            alt={shape.image_alt_text || 'Shape'}
            className="h-12 w-12 rounded object-cover"
          />
        )
      },
      enableSorting: false,
      size: 80,
    },
    {
      accessorKey: 'image_alt_text',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alt Text" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.image_alt_text || '-'}</span>
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
        const shape = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(shape)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(shape.id)}>
                {shape.status ? (
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
                onClick={() => onDelete(shape.id)}
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

export function ShopByShapeTable({
  shapes,
  onEdit,
  onDelete,
  onToggleStatus,
}: ShopByShapeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shapeToDelete, setShapeToDelete] = useState<string | null>(null)

  const handleDeleteClick = (shapeId: string) => {
    setShapeToDelete(shapeId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (shapeToDelete) {
      onDelete(shapeToDelete)
      setShapeToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const columns = useMemo(
    () => createColumns(onEdit, handleDeleteClick, onToggleStatus),
    [onEdit, onToggleStatus]
  )

  const sortedShapes = useMemo(
    () => [...shapes].sort((a, b) => a.rank - b.rank),
    [shapes]
  )

  if (shapes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No shapes found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click &quot;Add Shape&quot; to create your first entry
        </p>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={sortedShapes}
        showPagination={false}
        showToolbar={false}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shape</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shape? This action cannot be undone.
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
