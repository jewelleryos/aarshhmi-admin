"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { ShoppingBag, MoreVertical, Eye } from "lucide-react"
import type { OrderListItem } from "@/redux/services/orderService"
import {
  STAGE_LABELS,
  PAYMENT_STATUS_STYLES,
  formatPrice,
  formatDate,
} from "./shared/order.constants"

interface OrdersTableProps {
  items: OrderListItem[]
}

export function OrdersTable({ items }: OrdersTableProps) {
  const router = useRouter()
  const [filteredCount, setFilteredCount] = useState<number>(0)

  // Update filtered count when items change
  useEffect(() => {
    setFilteredCount(items.length)
  }, [items])

  const columns = useMemo<ColumnDef<OrderListItem>[]>(() => [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order #" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.order_number}</span>
      ),
      size: 140,
    },
    {
      id: "customer",
      accessorFn: (row) => row.customer_name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" sortable />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.customer_name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.customer_email || row.original.customer_phone || "—"}
          </span>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" sortable />
      ),
      cell: ({ row }) => {
        const discount = row.original.coupon_discount
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{formatPrice(row.original.total_amount)}</span>
            {discount > 0 && (
              <span className="text-xs text-green-600">
                -{formatPrice(discount)} coupon
              </span>
            )}
          </div>
        )
      },
      size: 140,
    },
    {
      accessorKey: "total_quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.item_count} {row.original.item_count === 1 ? "item" : "items"}
        </span>
      ),
      size: 80,
    },
    {
      id: "stage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const stages = row.original.item_stages
        if (!stages || stages.length === 0) {
          return <span className="text-sm text-muted-foreground">—</span>
        }
        return (
          <div className="flex flex-col gap-1">
            {stages.map(({ stage, count }) => {
              const info = STAGE_LABELS[stage]
              return (
                <Badge
                  key={stage}
                  variant="outline"
                  className={`text-[11px] font-normal w-fit ${info?.className || "bg-gray-50 text-gray-500 border-gray-200"}`}
                >
                  {count > 1 ? `${count}× ` : ""}{info?.label || `Stage ${stage}`}
                </Badge>
              )
            })}
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "payment_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" sortable />
      ),
      cell: ({ row }) => {
        const status = row.original.payment_status
        const paymentInfo = PAYMENT_STATUS_STYLES[status]
        return (
          <Badge variant="outline" className={paymentInfo?.className || "bg-gray-50 text-gray-500 border-gray-200"}>
            {paymentInfo?.label || status}
          </Badge>
        )
      },
      size: 120,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/orders/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50,
    },
  ], [router])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Orders will appear here when customers place them on the storefront.
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="order_number"
      searchPlaceholder="Search by order number..."
      showPagination={true}
      showToolbar={true}
      maxHeight="400px"
      totalLabel={`Showing: ${filteredCount} order${filteredCount !== 1 ? 's' : ''}`}
      onFilteredCountChange={setFilteredCount}
    />
  )
}
