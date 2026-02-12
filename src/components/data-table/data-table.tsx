"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

export interface DataTableProps<TData, TValue> {
  // Required
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Search
  searchKey?: string
  searchPlaceholder?: string

  // Pagination visibility
  showPagination?: boolean

  // Page size options
  pageSizeOptions?: number[]

  // Pagination mode
  paginationMode?: "client" | "server"

  // Server-side pagination props
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void

  // Column features
  enableColumnResizing?: boolean

  // Toolbar options
  showToolbar?: boolean
  showColumnVisibility?: boolean

  // Layout options
  maxHeight?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  showPagination = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  paginationMode = "client",
  pageCount,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  onPaginationChange,
  enableColumnResizing = true,
  showToolbar = true,
  showColumnVisibility = true,
  maxHeight,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Internal pagination state for client mode
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] || 10,
  })

  // Use controlled pagination for server mode, internal for client mode
  const pagination = React.useMemo(() => {
    if (paginationMode === "server") {
      return {
        pageIndex: controlledPageIndex ?? 0,
        pageSize: controlledPageSize ?? (pageSizeOptions[0] || 10),
      }
    }
    return internalPagination
  }, [paginationMode, controlledPageIndex, controlledPageSize, internalPagination, pageSizeOptions])

  // Handle pagination change
  const handlePaginationChange = React.useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination = typeof updater === "function" ? updater(pagination) : updater

      if (paginationMode === "server" && onPaginationChange) {
        onPaginationChange({
          pageIndex: newPagination.pageIndex,
          pageSize: newPagination.pageSize,
        })
      } else {
        setInternalPagination(newPagination)
      }
    },
    [paginationMode, onPaginationChange, pagination]
  )

  const table = useReactTable({
    data,
    columns,
    enableColumnResizing,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Only apply pagination when showPagination is true
    ...(showPagination && paginationMode === "client" && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    // Server-side pagination config
    ...(showPagination && paginationMode === "server" && {
      manualPagination: true,
      pageCount: pageCount ?? -1,
    }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(showPagination && {
      onPaginationChange: handlePaginationChange,
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(showPagination && { pagination }),
    },
  })

  return (
    <div className="w-full space-y-4">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          showColumnVisibility={showColumnVisibility}
        />
      )}
      <div
        className="w-full overflow-auto rounded-md border max-h-137.5"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-30 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={index === 0 ? "pl-4" : undefined}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        position: "relative",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-primary/50 ${
                            header.column.getIsResizing() ? "bg-primary" : ""
                          }`}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={index === 0 ? "pl-4" : undefined}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center pl-4"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}
