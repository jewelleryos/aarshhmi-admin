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
import { Eye, MoreVertical } from "lucide-react"
import type { ContactInquiryListItem } from "@/redux/services/contactUsService"

interface ContactUsTableProps {
  items: ContactInquiryListItem[]
  onView: (item: ContactInquiryListItem) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

function createColumns(
  onView: (item: ContactInquiryListItem) => void
): ColumnDef<ContactInquiryListItem>[] {
  return [
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{formatDate(row.original.created_at)}</span>
      ),
      size: 160,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" sortable />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">{row.original.email || <span className="text-muted-foreground">—</span>}</div>
          {row.original.phone && (
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {truncate(row.original.message, 70)}
        </span>
      ),
      size: 280,
    },
    {
      accessorKey: "is_consent_given",
      header: "Consent",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.is_consent_given
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }
        >
          {row.original.is_consent_given ? "Given" : "Not given"}
        </Badge>
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
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
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

export function ContactUsTable({ items, onView }: ContactUsTableProps) {
  const columns = useMemo(() => createColumns(onView), [onView])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Eye className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No contact inquiries found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customer submissions will appear here
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      searchKey="name"
      searchPlaceholder="Search by name or email..."
      totalLabel={`Total: ${items.length} ${items.length !== 1 ? "inquiries" : "inquiry"}`}
    />
  )
}
