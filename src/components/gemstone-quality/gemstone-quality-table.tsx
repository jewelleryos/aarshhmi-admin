"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, FolderOpen, MoreVertical } from "lucide-react"
import { GemstoneQuality } from "@/redux/services/gemstoneQualityService"
import { getCdnUrl } from "@/utils/cdn"

interface GemstoneQualityTableProps {
  items: GemstoneQuality[]
  onEdit: (item: GemstoneQuality) => void
  canUpdate: boolean
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
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// Create columns
function createColumns(
  onEdit: (item: GemstoneQuality) => void,
  canUpdate: boolean
): ColumnDef<GemstoneQuality>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      size: 150,
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
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const item = row.original
        const imageUrl = getCdnUrl(item.image_url)
        return imageUrl ? (
          <img
            src={imageUrl}
            alt={item.image_alt_text || item.name}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground">-</span>
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
          {truncate(row.original.description, 50)}
        </span>
      ),
      size: 200,
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
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
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

export function GemstoneQualityTable({
  items,
  onEdit,
  canUpdate,
}: GemstoneQualityTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, canUpdate),
    [onEdit, canUpdate]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No gemstone qualities found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first gemstone quality to get started
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
