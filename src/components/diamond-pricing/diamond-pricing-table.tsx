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
import { DiamondPrice } from "@/redux/services/diamondPricingService"
import { formatCurrency } from "@/utils/currency"

interface DiamondPricingTableProps {
  items: DiamondPrice[]
  onEdit: (item: DiamondPrice) => void
  canUpdate: boolean
}

// Format carat value (4 decimal places)
function formatCarat(value: number): string {
  return value.toFixed(4)
}

// Create columns
function createColumns(
  onEdit: (item: DiamondPrice) => void,
  canUpdate: boolean
): ColumnDef<DiamondPrice>[] {
  return [
    {
      accessorKey: "shape_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Shape" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.shape_name || "-"}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "quality_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Clarity/Color" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.quality_name || "-"}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "ct_from",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Carat From" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm font-mono">
          {formatCarat(row.original.ct_from)}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "ct_to",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Carat To" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm font-mono">
          {formatCarat(row.original.ct_to)}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price/Ct" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.price)}
        </span>
      ),
      size: 120,
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

export function DiamondPricingTable({
  items,
  onEdit,
  canUpdate,
}: DiamondPricingTableProps) {
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
          No diamond prices found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first diamond price entry to get started
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
