"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Edit, FolderTree, MoreVertical, Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCdnUrl } from "@/utils/cdn"
import type { FlattenedCategory, Category } from "@/redux/services/categoryService"

interface CategoriesTableProps {
  items: FlattenedCategory[]
  onEdit: (item: Category) => void
  onEditSeo: (item: Category) => void
  onDelete: (item: Category) => void
  canUpdate: boolean
  canDelete: boolean
}

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Truncate text
function truncate(text: string | null, maxLength: number): string {
  if (!text) return "-"
  // Strip HTML tags for display
  const stripped = text.replace(/<[^>]*>/g, "")
  if (stripped.length <= maxLength) return stripped
  return stripped.slice(0, maxLength) + "..."
}

// Create columns
function createColumns(
  onEdit: (item: Category) => void,
  onEditSeo: (item: Category) => void,
  onDelete: (item: Category) => void,
  canUpdate: boolean,
  canDelete: boolean
): ColumnDef<FlattenedCategory>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <span
          className={cn(
            row.original.level === 0 && "font-medium",
            row.original.level === 1 && "pl-6"
          )}
        >
          {row.original.level === 1 && (
            <span className="text-muted-foreground mr-2">└</span>
          )}
          {row.original.name}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.slug}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "media",
      header: "Media",
      cell: ({ row }) => {
        const item = row.original
        const mediaUrl = getCdnUrl(item.media_url)
        if (!mediaUrl) {
          return <span className="text-muted-foreground">-</span>
        }
        // Check if it's a video
        const isVideo = item.media_url?.toLowerCase().endsWith(".mp4")
        if (isVideo) {
          return (
            <video
              src={mediaUrl}
              className="h-10 w-10 rounded object-cover"
              muted
            />
          )
        }
        return (
          <img
            src={mediaUrl}
            alt={item.media_alt_text || item.name}
            className="h-10 w-10 rounded object-cover"
          />
        )
      },
      enableSorting: false,
      size: 60,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {truncate(row.original.description, 40)}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "is_filterable",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Filterable" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.is_filterable ? "default" : "secondary"}>
          {row.original.is_filterable ? "Yes" : "No"}
        </Badge>
      ),
      size: 90,
    },
    {
      accessorKey: "rank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.rank}</span>
      ),
      size: 70,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.created_at)}
        </span>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
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
              {canUpdate && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEditSeo(item)}>
                    <Search className="mr-2 h-4 w-4" />
                    Edit SEO
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (canUpdate && <DropdownMenuSeparator />)}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
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

export function CategoriesTable({
  items,
  onEdit,
  onEditSeo,
  onDelete,
  canUpdate,
  canDelete,
}: CategoriesTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, onEditSeo, onDelete, canUpdate, canDelete),
    [onEdit, onEditSeo, onDelete, canUpdate, canDelete]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderTree className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No categories found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first category to get started
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      showPagination={false}
      showToolbar={false}
    />
  )
}
