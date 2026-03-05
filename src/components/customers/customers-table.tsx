"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { CustomerListItem } from "@/redux/services/customerService"

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(dateStr)
}

function formatPhone(phone: string | null): string {
  if (!phone) return "—"
  if (phone.length > 10) {
    return `+${phone.slice(0, phone.length - 10)} ${phone.slice(-10)}`
  }
  return phone
}

const LOGIN_METHOD_LABELS: Record<string, string> = {
  sms: "SMS",
  whatsapp: "WhatsApp",
  google: "Google",
  facebook: "Facebook",
}

function createColumns(): ColumnDef<CustomerListItem>[] {
  return [
    {
      id: "name",
      accessorFn: (row) =>
        [row.first_name, row.last_name].filter(Boolean).join(" ") || "—",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => {
        const name = [row.original.first_name, row.original.last_name]
          .filter(Boolean)
          .join(" ")
        return (
          <span className="font-medium">{name || "—"}</span>
        )
      },
      size: 180,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.email || "—"}
        </span>
      ),
      size: 220,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatPhone(row.original.phone)}
        </span>
      ),
      enableSorting: false,
      size: 150,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" sortable />
      ),
      cell: ({ row }) => {
        const isActive = row.original.is_active
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
      accessorKey: "last_login_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Login" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.last_login_at)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "last_login_method",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Login Method" />
      ),
      cell: ({ row }) => {
        const method = row.original.last_login_method
        if (!method) return <span className="text-sm text-muted-foreground">—</span>
        return (
          <Badge variant="outline" className="text-xs">
            {LOGIN_METHOD_LABELS[method] || method}
          </Badge>
        )
      },
      enableSorting: false,
      size: 120,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
      size: 120,
    },
  ]
}

interface CustomersTableProps {
  items: CustomerListItem[]
}

export function CustomersTable({ items }: CustomersTableProps) {
  const columns = useMemo(() => createColumns(), [])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No customers yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customers will appear here when they sign up on the storefront.
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="email"
      searchPlaceholder="Search by email..."
      showPagination={true}
      showToolbar={true}
    />
  )
}
