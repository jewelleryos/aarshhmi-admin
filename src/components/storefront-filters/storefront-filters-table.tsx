"use client"

import { useMemo, useState, Fragment } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Filter,
  Loader2,
  MoreVertical,
} from "lucide-react"
import { getCdnUrl } from "@/utils/cdn"
import type { FilterGroup, FilterValue } from "@/redux/services/storefrontFiltersService"

interface StorefrontFiltersTableProps {
  filters: FilterGroup[]
  isLoading: boolean
  canUpdate: boolean
  onEditGroup: (group: FilterGroup) => void
  onEditValue: (group: FilterGroup, value: FilterValue) => void
}

// Create columns for filter groups
function createColumns(
  canUpdate: boolean,
  onEditGroup: (group: FilterGroup) => void
): ColumnDef<FilterGroup>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.rank}</span>
      ),
      size: 60,
    },
    {
      id: "media",
      header: "Image",
      cell: ({ row }) => {
        const mediaUrl = getCdnUrl(row.original.media_url)
        if (!mediaUrl) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <img
            src={mediaUrl}
            alt={row.original.media_alt_text || row.original.name}
            className="h-8 w-8 rounded object-cover"
          />
        )
      },
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Filter Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_system_generated && (
            <Badge variant="secondary" className="text-xs">
              SYS
            </Badge>
          )}
        </div>
      ),
      size: 180,
    },
    {
      id: "display_name",
      header: "Display Name",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.display_name || row.original.name}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: "is_filterable",
      header: () => <div className="text-center">Visible</div>,
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
        const group = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEditGroup(group)}>
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

// Render expanded row content (filter values)
function ExpandedRowContent({
  group,
  canUpdate,
  onEditValue,
}: {
  group: FilterGroup
  canUpdate: boolean
  onEditValue: (group: FilterGroup, value: FilterValue) => void
}) {
  if (group.values.length === 0) {
    return (
      <TableRow className="bg-muted/20">
        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
          No filter values in this group
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {group.values.map((value) => {
        const valueMediaUrl = getCdnUrl(value.media_url)

        return (
          <TableRow key={value.id} className="bg-muted/20 hover:bg-muted/30">
            {/* Expander placeholder */}
            <TableCell style={{ width: 40 }}></TableCell>
            {/* Rank */}
            <TableCell style={{ width: 60 }}>
              <span className="text-sm text-muted-foreground pl-2">
                {value.rank}
              </span>
            </TableCell>
            {/* Image */}
            <TableCell style={{ width: 60 }}>
              {valueMediaUrl ? (
                <img
                  src={valueMediaUrl}
                  alt={value.media_alt_text || value.name}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            {/* Name */}
            <TableCell style={{ width: 180 }}>
              <div className="flex items-center gap-2 pl-2">
                <span className="text-sm">{value.name}</span>
                {value.is_system_generated && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    SYS
                  </Badge>
                )}
              </div>
            </TableCell>
            {/* Display Name */}
            <TableCell style={{ width: 160 }}>
              <span className="text-sm text-muted-foreground">
                {value.display_name || value.name}
              </span>
            </TableCell>
            {/* Visible */}
            <TableCell style={{ width: 100 }}>
              <div className="text-center">
                <Badge variant={value.is_filterable ? "default" : "secondary"}>
                  {value.is_filterable ? "Yes" : "No"}
                </Badge>
              </div>
            </TableCell>
            {/* Actions */}
            <TableCell style={{ width: 80 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canUpdate && (
                    <DropdownMenuItem
                      onClick={() => onEditValue(group, value)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )
      })}
    </>
  )
}

export function StorefrontFiltersTable({
  filters,
  isLoading,
  canUpdate,
  onEditGroup,
  onEditValue,
}: StorefrontFiltersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Memoize columns
  const columns = useMemo(
    () => createColumns(canUpdate, onEditGroup),
    [canUpdate, onEditGroup]
  )

  const table = useReactTable({
    data: filters,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Empty state
  if (filters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Filter className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No filters found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create tag groups and tags to see them here
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-md border max-h-137.5">
      <Table>
        <TableHeader className="sticky top-0 z-30 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={index === 0 ? "pl-4" : undefined}
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
            <Fragment key={row.id}>
              {/* Parent row (filter group) */}
              <TableRow className="bg-background hover:bg-muted/10">
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    className={index === 0 ? "pl-4" : undefined}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>

              {/* Expanded content (filter values) */}
              {row.getIsExpanded() && (
                <ExpandedRowContent
                  group={row.original}
                  canUpdate={canUpdate}
                  onEditValue={onEditValue}
                />
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
