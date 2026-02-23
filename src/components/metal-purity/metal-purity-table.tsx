"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, FolderOpen, MoreVertical, Trash2 } from "lucide-react"
import type { MetalPurity } from "@/redux/services/metalPurityService"
import { getCdnUrl } from "@/utils/cdn"
import { formatCurrency } from "@/utils/currency"

interface MetalPurityTableProps {
  items: MetalPurity[]
  onEdit: (item: MetalPurity) => void
  onDelete: (item: MetalPurity) => void
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
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// Create columns
function createColumns(
  onEdit: (item: MetalPurity) => void,
  onDelete: (item: MetalPurity) => void,
  canUpdate: boolean,
  canDelete: boolean
): ColumnDef<MetalPurity>[] {
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
      accessorKey: "metal_type_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Metal Type" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.metal_type_name}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price/gram" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatCurrency(row.original.price)}
        </span>
      ),
      size: 120,
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
              {canDelete && canUpdate && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-red-600 focus:text-red-600"
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

export function MetalPurityTable({
  items,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: MetalPurityTableProps) {
  // Metal type filter state
  const [metalTypeFilter, setMetalTypeFilter] = useState<string>("all")

  // Get unique metal types from items
  const metalTypes = useMemo(() => {
    const unique = new Map<string, string>()
    items.forEach(item => {
      unique.set(item.metal_type_id, item.metal_type_name)
    })
    return Array.from(unique, ([id, name]) => ({ id, name }))
  }, [items])

  // Filtered items based on metal type
  const filteredItems = useMemo(() => {
    if (metalTypeFilter === "all") return items
    return items.filter(item => item.metal_type_id === metalTypeFilter)
  }, [items, metalTypeFilter])

  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, onDelete, canUpdate, canDelete),
    [onEdit, onDelete, canUpdate, canDelete]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No metal purities found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first metal purity to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={metalTypeFilter} onValueChange={setMetalTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by metal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Metal Types</SelectItem>
            {metalTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        showPagination={false}
        showToolbar={false}
      />
    </div>
  )
}
