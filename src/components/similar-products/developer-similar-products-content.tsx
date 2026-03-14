'use client'

import { useState, useEffect, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Loader2, RefreshCw, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import similarProductsSyncService, {
  type ScoringCondition,
  type SyncJob,
} from '@/redux/services/similarProductsSyncService'
import similarProductsService from '@/redux/services/similarProductsService'

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  running: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function createJobColumns(): ColumnDef<SyncJob>[] {
  return [
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" sortable />,
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
      accessorKey: 'total_products',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" sortable />,
      cell: ({ row }) => <span className="text-sm">{row.original.total_products}</span>,
      size: 80,
    },
    {
      accessorKey: 'processed_products',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Processed" sortable />,
      cell: ({ row }) => <span className="text-sm">{row.original.processed_products}</span>,
      size: 100,
    },
    {
      accessorKey: 'failed_products',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Failed" sortable />,
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
      accessorKey: 'started_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Started At" sortable />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDateTime(row.original.started_at)}
        </span>
      ),
      size: 180,
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDuration(row.original.started_at, row.original.completed_at)}
        </span>
      ),
      enableSorting: false,
      size: 100,
    },
  ]
}

export function DeveloperSimilarProductsContent() {
  const [conditions, setConditions] = useState<ScoringCondition[]>([])
  const [jobs, setJobs] = useState<SyncJob[]>([])
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchConfig()
    fetchJobs()
  }, [])

  const fetchConfig = async () => {
    try {
      setIsLoadingConfig(true)
      const response = await similarProductsSyncService.listConfig()
      setConditions(response.data.items)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch scoring config')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true)
      const response = await similarProductsSyncService.listJobs()
      setJobs(response.data.items)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch sync jobs')
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const handleWeightChange = async (id: string, weight: number) => {
    try {
      await similarProductsSyncService.updateConfig(id, { weight })
      setConditions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, weight } : c))
      )
      toast.success('Weight updated')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update')
    }
  }

  const handleActiveToggle = async (id: string, is_active: boolean) => {
    try {
      await similarProductsSyncService.updateConfig(id, { is_active })
      setConditions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active } : c))
      )
      toast.success(is_active ? 'Condition activated' : 'Condition deactivated')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update')
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await similarProductsService.triggerSync()
      toast.success('Sync triggered successfully')
      setTimeout(() => fetchJobs(), 1000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to trigger sync')
    } finally {
      setIsSyncing(false)
    }
  }

  const totalWeight = conditions.reduce((sum, c) => sum + (c.is_active ? c.weight : 0), 0)
  const jobColumns = useMemo(() => createJobColumns(), [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer: Similar Products</h1>
        <p className="text-muted-foreground">
          Scoring config and sync job history
        </p>
      </div>

      {/* Scoring Config Section */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Scoring Config</h2>
          {isLoadingConfig ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {conditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="flex items-center gap-4 rounded-md border p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{condition.label}</p>
                      <p className="text-xs text-muted-foreground">{condition.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="w-20 text-center"
                        value={condition.weight}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setConditions((prev) =>
                            prev.map((c) => (c.id === condition.id ? { ...c, weight: val } : c))
                          )
                        }}
                        onBlur={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                          handleWeightChange(condition.id, val)
                        }}
                      />
                      <Checkbox
                        checked={condition.is_active}
                        onCheckedChange={(checked) =>
                          handleActiveToggle(condition.id, checked === true)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Total active weight: <strong>{totalWeight}</strong>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sync Jobs Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sync Jobs</h2>
            <Button onClick={handleSync} disabled={isSyncing} size="sm">
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync Now
            </Button>
          </div>
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No sync jobs found. Click &quot;Sync Now&quot; to start.
              </p>
            </div>
          ) : (
            <DataTable
              columns={jobColumns}
              data={jobs}
              showPagination={false}
              showToolbar={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
