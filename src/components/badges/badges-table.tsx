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
import { Award, Edit, MoreVertical } from "lucide-react"
import type { Badge } from "@/redux/services/badgeService"

interface BadgesTableProps {
  items: Badge[]
  onEdit: (item: Badge) => void
  canUpdate: boolean
}

// Position label mapping
const POSITION_LABELS: Record<number, string> = {
  1: "Top Left",
  2: "Top Center",
  3: "Top Right",
  4: "Bottom Left",
  5: "Bottom Center",
  6: "Bottom Right",
}

// Get position label
function getPositionLabel(position: number): string {
  return POSITION_LABELS[position] || "Unknown"
}

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Create columns
function createColumns(
  onEdit: (item: Badge) => void,
  canUpdate: boolean
): ColumnDef<Badge>[] {
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
      id: "preview",
      header: "Preview",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: item.bg_color,
              color: item.font_color,
            }}
          >
            {item.name}
          </div>
        )
      },
      enableSorting: false,
      size: 120,
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Position" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {getPositionLabel(row.original.position)}
        </span>
      ),
      size: 120,
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

export function BadgesTable({
  items,
  onEdit,
  canUpdate,
}: BadgesTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, canUpdate),
    [onEdit, canUpdate]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Award className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No badges found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first badge to get started
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
