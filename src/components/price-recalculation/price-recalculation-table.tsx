"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderOpen, MoreVertical, AlertCircle } from "lucide-react"
import { ErrorDetailsDialog } from "./error-details-dialog"
import type { RecalculationJob } from "@/redux/services/priceRecalculationService"

const TRIGGER_LABELS: Record<string, string> = {
  metal_purity: 'Metal Purity',
  diamond_pricing: 'Diamond Pricing',
  diamond_pricing_bulk: 'Diamond Pricing (Bulk)',
  gemstone_pricing: 'Gemstone Pricing',
  gemstone_pricing_bulk: 'Gemstone Pricing (Bulk)',
  making_charge: 'Making Charge',
  other_charge: 'Other Charge',
  mrp_markup: 'MRP Markup',
  pricing_rule: 'Pricing Rule',
  manual: 'Manual',
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  running: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

interface PriceRecalculationTableProps {
  jobs: RecalculationJob[]
}

function createColumns(
  onViewErrors: (job: RecalculationJob) => void
): ColumnDef<RecalculationJob>[] {
  return [
    {
      accessorKey: "trigger_source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trigger Source" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {TRIGGER_LABELS[row.original.trigger_source] || row.original.trigger_source}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" sortable />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant="outline" className={STATUS_STYLES[status] || ''}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
      size: 120,
    },
    {
      accessorKey: "started_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Started At" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDateTime(row.original.started_at)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "completed_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Completed At" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDateTime(row.original.completed_at)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "processed_products",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Processed" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.processed_products}</span>
      ),
      size: 100,
    },
    {
      accessorKey: "failed_products",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Failed" sortable />
      ),
      cell: ({ row }) => {
        const failed = row.original.failed_products
        return (
          <span className={`text-sm ${failed > 0 ? 'text-red-600 font-medium' : ''}`}>
            {failed}
          </span>
        )
      },
      size: 80,
    },
    {
      accessorKey: "total_products",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.total_products}</span>
      ),
      size: 80,
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDuration(row.original.started_at, row.original.completed_at)}
        </span>
      ),
      enableSorting: false,
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original
        const hasErrors = job.failed_products > 0

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onViewErrors(job)}
                disabled={!hasErrors}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                View Errors
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

export function PriceRecalculationTable({ jobs }: PriceRecalculationTableProps) {
  const [selectedJob, setSelectedJob] = useState<RecalculationJob | null>(null)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)

  const handleViewErrors = (job: RecalculationJob) => {
    setSelectedJob(job)
    setIsErrorDialogOpen(true)
  }

  const columns = useMemo(
    () => createColumns(handleViewErrors),
    []
  )

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No recalculation jobs found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Jobs will appear here when price recalculations are triggered
        </p>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={jobs}
        showPagination={false}
        showToolbar={false}
      />
      <ErrorDetailsDialog
        job={selectedJob}
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
      />
    </>
  )
}
