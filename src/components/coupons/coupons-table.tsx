"use client"

import { useMemo } from "react"
import type { ReactNode } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, FolderOpen } from "lucide-react"
import type { CouponListItem } from "./types"
import { TYPE_BADGE_COLORS } from "./types"

interface CouponsTableProps {
  items: CouponListItem[]
  onEdit: (item: CouponListItem) => void
  onDelete: (item: CouponListItem) => void
  canUpdate: boolean
  canDelete: boolean
  filterComponent?: ReactNode
  hasCustomFilter?: boolean
  onResetFilters?: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No expiry"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function createColumns(
  onEdit: (item: CouponListItem) => void,
  onDelete: (item: CouponListItem) => void,
  canUpdate: boolean,
  canDelete: boolean
): ColumnDef<CouponListItem>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{row.original.code}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "typeLabel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" sortable />
      ),
      cell: ({ row }) => {
        const colorClass =
          TYPE_BADGE_COLORS[row.original.type] ||
          "bg-gray-50 text-gray-700 border-gray-200"
        return (
          <Badge variant="outline" className={colorClass}>
            {row.original.typeLabel}
          </Badge>
        )
      },
      size: 160,
    },
    {
      accessorKey: "discountDisplay",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Discount" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.discountDisplay}</span>
      ),
      size: 200,
    },
    {
      accessorKey: "validUntil",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valid Until" sortable />
      ),
      cell: ({ row }) => {
        const dateStr = row.original.validUntil
        const isExpired =
          dateStr && new Date(dateStr) < new Date()
        return (
          <span
            className={`text-sm ${!dateStr ? "text-muted-foreground" : ""} ${isExpired ? "text-destructive" : ""}`}
          >
            {formatDate(dateStr)}
            {isExpired && " (Expired)"}
          </span>
        )
      },
      size: 130,
    },
    {
      id: "usage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage" />
      ),
      cell: ({ row }) => {
        const { usageCount, usageLimit } = row.original
        const limitText = usageLimit ? usageLimit.toString() : "Unlimited"
        return (
          <span className="text-sm">
            {usageCount} / {limitText}
          </span>
        )
      },
      size: 120,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" sortable />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return (
          <Badge
            variant="outline"
            className={
              isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original
        if (!canUpdate && !canDelete) return null

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
              {canUpdate && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(item)}
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

export function CouponsTable({
  items,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
  filterComponent,
  hasCustomFilter,
  onResetFilters,
}: CouponsTableProps) {
  const columns = useMemo(
    () => createColumns(onEdit, onDelete, canUpdate, canDelete),
    [onEdit, onDelete, canUpdate, canDelete]
  )

  if (items.length === 0 && !hasCustomFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No coupons yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first coupon to get started.
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="code"
      searchPlaceholder="Search by code..."
      showPagination={true}
      showToolbar={true}
      totalLabel={`${items.length} coupon${items.length !== 1 ? 's' : ''}`}
      filterComponent={filterComponent}
      hasCustomFilter={hasCustomFilter}
      onResetFilters={onResetFilters}
    />
  )
}
