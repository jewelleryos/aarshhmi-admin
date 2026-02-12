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
import { Edit, FolderOpen, MoreVertical, Trash2 } from "lucide-react"
import type { OtherCharge } from "@/redux/services/otherChargeService"
import { formatCurrency } from "@/utils/currency"

interface OtherChargesTableProps {
  items: OtherCharge[]
  onEdit: (item: OtherCharge) => void
  onDelete: (item: OtherCharge) => void
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

// Create columns
function createColumns(
  onEdit: (item: OtherCharge) => void,
  onDelete: (item: OtherCharge) => void,
  canUpdate: boolean,
  canDelete: boolean
): ColumnDef<OtherCharge>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      size: 200,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.description || "-"}
        </span>
      ),
      size: 250,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatCurrency(row.original.amount)}
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
      size: 120,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original
        const hasActions = canUpdate || canDelete

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

export function OtherChargesTable({
  items,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: OtherChargesTableProps) {
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
          No other charges found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first other charge to get started
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
