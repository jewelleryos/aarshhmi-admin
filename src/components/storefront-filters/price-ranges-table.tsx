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
import { Edit, IndianRupee, MoreVertical, Trash2 } from "lucide-react"
import { DeleteDialogWithDelay } from "@/components/ui/delete-dialog-with-delay"
import type { PriceFilterRange } from "@/redux/services/storefrontFiltersService"

// Format paise to rupees with Indian locale
function formatPriceInRupees(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString("en-IN")}`
}

interface PriceRangesTableProps {
  items: PriceFilterRange[]
  onEdit: (item: PriceFilterRange) => void
  onDelete: (item: PriceFilterRange) => Promise<void>
  canUpdate: boolean
}

function createColumns(
  canUpdate: boolean,
  onEdit: (item: PriceFilterRange) => void,
  onDeleteClick: (item: PriceFilterRange) => void
): ColumnDef<PriceFilterRange>[] {
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
      accessorKey: "display_name",
      header: "Display Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.display_name}</span>
      ),
      size: 200,
    },
    {
      accessorKey: "min_price",
      header: "Min Price",
      cell: ({ row }) => (
        <span className="text-sm">{formatPriceInRupees(row.original.min_price)}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "max_price",
      header: "Max Price",
      cell: ({ row }) => (
        <span className="text-sm">{formatPriceInRupees(row.original.max_price)}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant={row.original.status ? "default" : "secondary"}>
            {row.original.status ? "Active" : "Inactive"}
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
                <>
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteClick(item)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
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

export function PriceRangesTable({
  items,
  onEdit,
  onDelete,
  canUpdate,
}: PriceRangesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [deleteTarget, setDeleteTarget] = useState<PriceFilterRange | null>(null)

  const columns = useMemo(
    () => createColumns(canUpdate, onEdit, setDeleteTarget),
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
        <IndianRupee className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No price ranges found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add price ranges to let customers filter by price
        </p>
      </div>
    )
  }

  return (
    <>
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

    <DeleteDialogWithDelay
      open={!!deleteTarget}
      onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      title="Delete Price Range"
      description={`Are you sure you want to delete "${deleteTarget?.display_name}"? This action cannot be undone.`}
      onConfirm={async () => {
        if (deleteTarget) await onDelete(deleteTarget)
        setDeleteTarget(null)
      }}
    />
    </>
  )
}
