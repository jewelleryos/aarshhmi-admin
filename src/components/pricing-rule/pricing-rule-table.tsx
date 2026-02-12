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
import { Edit, FolderOpen, MoreVertical, Trash2 } from "lucide-react"
import type { PricingRule } from "./types"
import { PRODUCT_TYPES, CONDITION_CONFIG } from "./types"

interface PricingRuleTableProps {
  items: PricingRule[]
  onEdit: (item: PricingRule) => void
  onDelete: (item: PricingRule) => void
  canUpdate: boolean
  canDelete: boolean
}

// Get product type name
function getProductTypeName(code: string): string {
  const productType = PRODUCT_TYPES.find((pt) => pt.code === code)
  return productType?.name || code
}

// Format conditions summary
function formatConditionsSummary(rule: PricingRule): string {
  if (rule.conditions.length === 0) return "No conditions"

  const conditionLabels = rule.conditions.map((c) => CONDITION_CONFIG[c.type]?.label || c.type)
  return conditionLabels.join(", ")
}

// Format actions summary
function formatActionsSummary(rule: PricingRule): string {
  const actions = rule.actions
  const parts: string[] = []

  if (actions.makingChargeMarkup > 0) parts.push(`Making: ${actions.makingChargeMarkup}%`)
  if (actions.diamondMarkup > 0) parts.push(`Diamond: ${actions.diamondMarkup}%`)
  if (actions.gemstoneMarkup > 0) parts.push(`Gemstone: ${actions.gemstoneMarkup}%`)
  if (actions.pearlMarkup > 0) parts.push(`Pearl: ${actions.pearlMarkup}%`)

  return parts.length > 0 ? parts.join(", ") : "No markup"
}

// Create columns
function createColumns(
  onEdit: (item: PricingRule) => void,
  onDelete: (item: PricingRule) => void,
  canUpdate: boolean,
  canDelete: boolean
): ColumnDef<PricingRule>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      size: 200,
    },
    {
      accessorKey: "product_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Type" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {getProductTypeName(row.original.product_type)}
        </span>
      ),
      size: 150,
    },
    {
      id: "conditions",
      header: "Conditions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {row.original.conditions.length}
          </Badge>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {formatConditionsSummary(row.original)}
          </span>
        </div>
      ),
      size: 250,
    },
    {
      id: "actions_summary",
      header: "Markup",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatActionsSummary(row.original)}
        </span>
      ),
      size: 200,
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
              {canDelete && (
                <>
                  {canUpdate && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className="text-destructive focus:text-destructive"
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
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
  ]
}

export function PricingRuleTable({
  items,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: PricingRuleTableProps) {
  // Memoize columns
  const columns = useMemo(
    () => createColumns(onEdit, onDelete, canUpdate, canDelete),
    [onEdit, onDelete, canUpdate, canDelete]
  )

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No pricing rules found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first pricing rule to calculate selling prices
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      showPagination={false}
      showToolbar={false}
    />
  )
}
