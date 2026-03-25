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
import { FolderOpen, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight, Settings } from 'lucide-react'
import type { NavItem } from '../services/cmsService'

interface NavbarTableProps {
  items: NavItem[]
  onEdit: (item: NavItem) => void
  onDelete: (itemId: string) => void
  onToggleStatus: (itemId: string) => void
  onManageMegaMenu: (item: NavItem) => void
}

function createColumns(
  onEdit: (item: NavItem) => void,
  onDelete: (itemId: string) => void,
  onToggleStatus: (itemId: string) => void,
  onManageMegaMenu: (item: NavItem) => void
): ColumnDef<NavItem>[] {
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      size: 150,
    },
    {
      accessorKey: 'link',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Link" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm max-w-48 truncate block">
          {row.original.link || '-'}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: 'isMegaMenu',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mega Menu" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isMegaMenu ? 'default' : 'outline'}>
          {row.original.isMegaMenu ? 'Yes' : 'No'}
        </Badge>
      ),
      size: 100,
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
              {item.isMegaMenu && (
                <DropdownMenuItem onClick={() => onManageMegaMenu(item)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Mega Menu
                </DropdownMenuItem>
              )}
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

export function NavbarTable({
  items,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageMegaMenu,
}: NavbarTableProps) {
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
    () => createColumns(onEdit, handleDeleteClick, onToggleStatus, onManageMegaMenu),
    [onEdit, onToggleStatus, onManageMegaMenu]
  )

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.rank - b.rank),
    [items]
  )

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No nav items found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click &quot;Add Nav Link&quot; to create your first navigation item
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
            <AlertDialogTitle>Delete Nav Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this navigation item? This action cannot be undone.
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
