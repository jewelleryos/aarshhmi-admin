"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Layers, MoreVertical } from "lucide-react"
import type { StorefrontFilterGroupConfig } from "@/redux/services/storefrontFiltersService"

// Format type to display label
function formatType(type: string): string {
  switch (type) {
    case "category":
      return "Category"
    case "price_filter":
      return "Price Filter"
    default:
      return type
  }
}

interface GroupConfigTableProps {
  items: StorefrontFilterGroupConfig[]
  onEdit: (item: StorefrontFilterGroupConfig) => void
  canUpdate: boolean
}

function createColumns(
  canUpdate: boolean,
  onEdit: (item: StorefrontFilterGroupConfig) => void
): ColumnDef<StorefrontFilterGroupConfig>[] {
  return [
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.rank}</span>
      ),
      size: 60,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {formatType(row.original.type)}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "display_name",
      header: "Display Name",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.display_name || <span className="text-muted-foreground">—</span>}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: "is_filterable",
      header: () => <div className="text-center">Filterable</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant={row.original.is_filterable ? "default" : "secondary"}>
            {row.original.is_filterable ? "Yes" : "No"}
          </Badge>
        </div>
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
      size: 80,
      enableSorting: false,
    },
  ]
}

export function GroupConfigTable({
  items,
  onEdit,
  canUpdate,
}: GroupConfigTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => createColumns(canUpdate, onEdit),
    [canUpdate, onEdit]
  )

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Layers className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No group configs found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Group configs are system-seeded and should appear automatically
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 z-30 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                    minWidth: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
