"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, FolderOpen, MoreVertical } from "lucide-react"
import type { MakingCharge } from "@/redux/services/makingChargeService"
import { CURRENCY_CONFIG } from "@/configs/currency"

interface MakingChargesTableProps {
  items: MakingCharge[]
  onEdit: (item: MakingCharge) => void
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

// Format weight with up to 4 decimal places (remove trailing zeros)
function formatWeight(value: string): string {
  const num = parseFloat(value)
  // Format with up to 4 decimal places, removing trailing zeros
  return num.toFixed(4).replace(/\.?0+$/, "")
}

// Format amount based on pricing type
function formatAmount(amount: string, isFixed: boolean): string {
  const value = parseFloat(amount)
  if (isFixed) {
    // Fixed price - format as currency per gram
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: "currency",
      currency: CURRENCY_CONFIG.code,
    }).format(value) + "/g"
  } else {
    // Percentage - show as percentage (stored as-is, no conversion needed)
    return `${value}%`
  }
}

// Create columns
function createColumns(
  onEdit: (item: MakingCharge) => void,
  canUpdate: boolean
): ColumnDef<MakingCharge>[] {
  return [
    {
      accessorKey: "metal_type_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Metal Type" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.metal_type_name}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "from",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From (g)" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{formatWeight(row.original.from)}</span>
      ),
      size: 100,
    },
    {
      accessorKey: "to",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To (g)" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{formatWeight(row.original.to)}</span>
      ),
      size: 100,
    },
    {
      accessorKey: "is_fixed_pricing",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.is_fixed_pricing ? "default" : "secondary"}>
          {row.original.is_fixed_pricing ? "Fixed" : "Percentage"}
        </Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatAmount(row.original.amount, row.original.is_fixed_pricing)}
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

export function MakingChargesTable({
  items,
  onEdit,
  canUpdate,
}: MakingChargesTableProps) {
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
    () => createColumns(onEdit, canUpdate),
    [onEdit, canUpdate]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No making charges found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first making charge to get started
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
