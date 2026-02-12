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
import { Edit, MoreVertical, Ruler } from "lucide-react"
import type { SizeChartGroup } from "@/redux/services/sizeChartGroupService"

interface SizeChartGroupsTableProps {
  items: SizeChartGroup[]
  onEdit: (item: SizeChartGroup) => void
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

// Create columns
function createColumns(
  onEdit: (item: SizeChartGroup) => void,
  canUpdate: boolean
): ColumnDef<SizeChartGroup>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      size: 300,
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

export function SizeChartGroupsTable({
  items,
  onEdit,
  canUpdate,
}: SizeChartGroupsTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, canUpdate),
    [onEdit, canUpdate]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Ruler className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No size chart groups found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first size chart group to get started
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
