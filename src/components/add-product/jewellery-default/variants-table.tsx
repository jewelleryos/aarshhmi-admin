"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { FolderOpen } from "lucide-react"

// Generated variant type
export interface Variant {
  id: string
  metalTypeId: string
  metalTypeName: string
  metalColorId: string
  metalColorName: string
  metalPurityId: string
  metalPurityName: string
  metalWeight: string
  diamondClarityColorId: string | null
  diamondClarityColorName: string | null
  gemstoneColorId: string | null
  gemstoneColorName: string | null
}

interface VariantsTableProps {
  variants: Variant[]
  defaultVariantId: string | null
  onDefaultChange: (variantId: string) => void
}

// Create columns
function createColumns(
  defaultVariantId: string | null,
  onDefaultChange: (variantId: string) => void
): ColumnDef<Variant>[] {
  return [
    {
      id: "default",
      header: "Default",
      cell: ({ row }) => {
        const variant = row.original
        const isDefault = variant.id === defaultVariantId
        return (
          <Checkbox
            checked={isDefault}
            onCheckedChange={() => onDefaultChange(variant.id)}
            aria-label="Set as default variant"
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 70,
    },
    {
      accessorKey: "metalTypeName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Metal Type" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.metalTypeName}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "metalColorName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.metalColorName}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "metalPurityName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purity" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.metalPurityName}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "metalWeight",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Weight" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm font-mono">
          {row.original.metalWeight} g
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "diamondClarityColorName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Diamond Quality" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.diamondClarityColorName || "-"}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "gemstoneColorName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gemstone Color" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.gemstoneColorName || "-"}
        </span>
      ),
      size: 140,
    },
  ]
}

export function VariantsTable({ variants, defaultVariantId, onDefaultChange }: VariantsTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(defaultVariantId, onDefaultChange),
    [defaultVariantId, onDefaultChange]
  )

  // Empty state
  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No variants generated
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure metal and stone details to generate variants
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={variants}
      showPagination={false}
      showToolbar={false}
    />
  )
}
