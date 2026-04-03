'use client'

import { useState, useEffect, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, RefreshCw, MoreVertical, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/usePermissions'
import PERMISSIONS from '@/configs/permissions.json'
import { formatCurrency } from '@/utils/currency'
import similarProductsService, { type SimilarProductListItem } from '@/redux/services/similarProductsService'
import { SimilarProductsEditDrawer } from './similar-products-edit-drawer'

function createColumns(
  onEdit: (product: SimilarProductListItem) => void,
  canUpdate: boolean
): ColumnDef<SimilarProductListItem>[] {
  return [
    {
      accessorKey: 'base_sku',
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
      size: 120,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" sortable />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
      size: 250,
    },
    {
      accessorKey: 'selling_price',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Selling Price" sortable />,
      cell: ({ row }) => {
        const price = row.original.selling_price
        return <span>{price ? formatCurrency(price) : '—'}</span>
      },
      size: 150,
    },
    {
      id: 'similar',
      header: 'Similar',
      cell: ({ row }) => {
        const { similar_count } = row.original
        return (
          <Badge variant="outline">
            {similar_count}/10
          </Badge>
        )
      },
      size: 100,
    },
    ...(canUpdate
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: { row: any }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 80,
          } as ColumnDef<SimilarProductListItem>,
        ]
      : []),
  ]
}

export function SimilarProductsContent() {
  const [products, setProducts] = useState<SimilarProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [drawerProduct, setDrawerProduct] = useState<SimilarProductListItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filteredCount, setFilteredCount] = useState<number>(0)

  const { has } = usePermissions()
  const canView = has(PERMISSIONS.SIMILAR_PRODUCTS.READ)
  const canUpdate = has(PERMISSIONS.SIMILAR_PRODUCTS.UPDATE)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await similarProductsService.listProducts({ limit: 1000 })
      setProducts(response.data.items)
      setFilteredCount(response.data.items.length)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch products')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (canView) fetchProducts()
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await similarProductsService.triggerSync()
      toast.success('Sync triggered successfully')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to trigger sync')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleEdit = (product: SimilarProductListItem) => {
    setDrawerProduct(product)
    setIsDrawerOpen(true)
  }

  const handleDrawerSaved = () => {
    fetchProducts()
  }

  const columns = useMemo(() => createColumns(handleEdit, canUpdate), [canUpdate])

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Similar Products</h1>
          <p className="text-muted-foreground">
            Manage similar product recommendations
          </p>
        </div>
        {canUpdate && (
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              searchKey="name"
              searchPlaceholder="Search by name or SKU..."
              showPagination={true}
              maxHeight="400px"
              totalLabel={`Showing: ${filteredCount} product${filteredCount !== 1 ? 's' : ''}`}
              onFilteredCountChange={setFilteredCount}
            />
          )}
        </CardContent>
      </Card>

      <SimilarProductsEditDrawer
        product={drawerProduct}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSaved={handleDrawerSaved}
      />
    </div>
  )
}
