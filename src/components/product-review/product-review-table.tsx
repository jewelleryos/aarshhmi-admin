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
import {
  CheckCircle2,
  Edit,
  FolderOpen,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react"
import type { ProductReviewListItem } from "@/redux/services/productReviewService"

interface ProductReviewTableProps {
  items: ProductReviewListItem[]
  onEdit: (item: ProductReviewListItem) => void
  onDelete: (item: ProductReviewListItem) => void
  onStatusToggle: (item: ProductReviewListItem) => void
  onApprove: (item: ProductReviewListItem) => void
  onReject: (item: ProductReviewListItem) => void
  canUpdate: boolean
  canDelete: boolean
  canUserStatusUpdate: boolean
  canUserDelete: boolean
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function truncate(text: string | null, maxLength: number): string {
  if (!text) return "-"
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

function createColumns(
  onEdit: (item: ProductReviewListItem) => void,
  onDelete: (item: ProductReviewListItem) => void,
  onStatusToggle: (item: ProductReviewListItem) => void,
  onApprove: (item: ProductReviewListItem) => void,
  onReject: (item: ProductReviewListItem) => void,
  canUpdate: boolean,
  canDelete: boolean,
  canUserStatusUpdate: boolean,
  canUserDelete: boolean
): ColumnDef<ProductReviewListItem>[] {
  return [
    {
      accessorKey: "product_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.product_name}</span>
      ),
      size: 180,
    },
    {
      accessorKey: "product_sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm font-mono">
          {row.original.product_sku}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" sortable />
      ),
      cell: ({ row }) => row.original.customer_name,
      size: 130,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {truncate(row.original.title, 40)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rating" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.rating} / 5</span>
      ),
      size: 80,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" sortable />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.type === "system" ? "default" : "secondary"}>
          {row.original.type}
        </Badge>
      ),
      size: 90,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" sortable />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.status
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }
        >
          {row.original.status ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "approval_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approval" sortable />
      ),
      cell: ({ row }) => {
        const status = row.original.approval_status
        const className =
          status === "approved"
            ? "bg-green-50 text-green-700 border-green-200"
            : status === "pending"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-red-50 text-red-600 border-red-200"
        return (
          <Badge variant="outline" className={className}>
            {status}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: "review_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Review Date" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.review_date)}
        </span>
      ),
      size: 110,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original
        const isSystem = item.type === "system"
        const showEdit = isSystem && canUpdate
        const showDelete = isSystem ? canDelete : canUserDelete
        const showApproval = !isSystem && canUserStatusUpdate
        const showStatusToggle = isSystem ? canUpdate : canUserStatusUpdate

        if (!showEdit && !showDelete && !showApproval && !showStatusToggle) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {showStatusToggle && (
                <DropdownMenuItem onClick={() => onStatusToggle(item)}>
                  {item.status ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Set Inactive
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Set Active
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {showApproval && item.approval_status !== "approved" && (
                <DropdownMenuItem onClick={() => onApprove(item)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
              )}
              {showApproval && item.approval_status !== "rejected" && (
                <DropdownMenuItem onClick={() => onReject(item)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              )}
              {showDelete && (showEdit || showApproval) && <DropdownMenuSeparator />}
              {showDelete && (
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

export function ProductReviewTable({
  items,
  onEdit,
  onDelete,
  onStatusToggle,
  onApprove,
  onReject,
  canUpdate,
  canDelete,
  canUserStatusUpdate,
  canUserDelete,
}: ProductReviewTableProps) {
  const columns = useMemo(
    () =>
      createColumns(
        onEdit,
        onDelete,
        onStatusToggle,
        onApprove,
        onReject,
        canUpdate,
        canDelete,
        canUserStatusUpdate,
        canUserDelete
      ),
    [onEdit, onDelete, onStatusToggle, onApprove, onReject, canUpdate, canDelete, canUserStatusUpdate, canUserDelete]
  )

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No reviews found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first product review to get started
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="product_name"
      searchPlaceholder="Filter by product name..."
      totalLabel={`Total: ${items.length} review${items.length !== 1 ? "s" : ""}`}
    />
  )
}
