"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Star, Trash2, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SizeChartValue } from "@/redux/services/sizeChartValueService"

interface SizeChartValuesTableProps {
  items: SizeChartValue[]
  onEdit: (item: SizeChartValue) => void
  onMakeDefault: (item: SizeChartValue) => void
  onDelete: (item: SizeChartValue) => void
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

// Format difference value
function formatDifference(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value
  if (numValue === 0 || isNaN(numValue)) return "0.00"
  const prefix = numValue > 0 ? "+" : ""
  return `${prefix}${numValue.toFixed(4)}`
}

// Create columns
function createColumns(
  onEdit: (item: SizeChartValue) => void,
  onMakeDefault: (item: SizeChartValue) => void,
  onDelete: (item: SizeChartValue) => void,
  canUpdate: boolean,
  canDelete: boolean
): ColumnDef<SizeChartValue>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_default && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "size_chart_group_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.size_chart_group_name}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.description || "-"}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: "difference",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Difference" sortable />
      ),
      cell: ({ row }) => {
        const diff =
          typeof row.original.difference === "string"
            ? parseFloat(row.original.difference)
            : row.original.difference
        return (
          <span
            className={cn(
              "text-sm font-mono",
              diff > 0 && "text-green-600",
              diff < 0 && "text-red-600",
              diff === 0 && "text-muted-foreground"
            )}
          >
            {formatDifference(row.original.difference)}
          </span>
        )
      },
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
      size: 150,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original
        const hasActions = canUpdate || (canDelete && !item.is_default)

        if (!hasActions) return null

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
              {canUpdate && !item.is_default && (
                <DropdownMenuItem onClick={() => onMakeDefault(item)}>
                  <Star className="mr-2 h-4 w-4" />
                  Make Default
                </DropdownMenuItem>
              )}
              {canDelete && !item.is_default && (
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

export function SizeChartValuesTable({
  items,
  onEdit,
  onMakeDefault,
  onDelete,
  canUpdate,
  canDelete,
}: SizeChartValuesTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, onMakeDefault, onDelete, canUpdate, canDelete),
    [onEdit, onMakeDefault, onDelete, canUpdate, canDelete]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <List className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No size chart values found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first size chart value to get started
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
