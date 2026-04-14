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
import { type MidSizeBannersItem, type CategoryWithChildrenForSelect } from '../../services/cmsService'

interface MidSizeBannersTableProps {
  items: MidSizeBannersItem[]
  categories: CategoryWithChildrenForSelect[]
  onEdit: (item: MidSizeBannersItem) => void
  onDelete: (itemId: string) => void
  onToggleStatus: (itemId: string) => void
}

function getCategoryNames(
  categoryIds: string[] | undefined,
  categories: CategoryWithChildrenForSelect[]
): string[] {
  if (!categoryIds || categoryIds.length === 0) return []
  return categoryIds.map((id) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.name ?? id
  })
}

function getSubCategoryNames(
  subCategoryIds: string[] | undefined,
  categories: CategoryWithChildrenForSelect[]
): string[] {
  if (!subCategoryIds || subCategoryIds.length === 0) return []
  const names: string[] = []
  for (const sub of subCategoryIds) {
    for (const cat of categories) {
      const child = cat.children?.find((c) => c.id === sub)
      if (child) { names.push(child.name); break }
    }
  }
  return names
}

function createColumns(
  categories: CategoryWithChildrenForSelect[],
  onEdit: (item: MidSizeBannersItem) => void,
  onDelete: (itemId: string) => void,
  onToggleStatus: (itemId: string) => void
): ColumnDef<MidSizeBannersItem>[] {
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
            alt={item.image_alt_text || 'Banner'}
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
        <span className="text-muted-foreground text-sm max-w-36 truncate block">
          {row.original.image_alt_text || '-'}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: 'category_ids',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Categories" />
      ),
      cell: ({ row }) => {
        const names = getCategoryNames(row.original.category_ids, categories)
        if (names.length === 0) {
          return <Badge variant="secondary">Global</Badge>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {names.map((name) => (
              <Badge key={name} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        )
      },
      size: 160,
    },
    {
      accessorKey: 'sub_category_ids',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sub-Categories" />
      ),
      cell: ({ row }) => {
        if (!row.original.category_ids?.length) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        const names = getSubCategoryNames(row.original.sub_category_ids, categories)
        if (names.length === 0) {
          return <span className="text-muted-foreground text-sm text-xs">All</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {names.map((name) => (
              <Badge key={name} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        )
      },
      size: 160,
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

export function MidSizeBannersTable({
  items,
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
}: MidSizeBannersTableProps) {
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

  const columns = useMemo(
    () => createColumns(categories, onEdit, handleDeleteClick, onToggleStatus),
    [categories, onEdit, onToggleStatus]
  )

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.rank - b.rank),
    [items]
  )

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No banners found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click &quot;Add Banner&quot; to create your first mid size banner
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
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
