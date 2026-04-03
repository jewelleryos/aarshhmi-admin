"use client"

import { useEffect, useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Loader2, MoreVertical, Eye, Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import productService, { type ProductListItem, type CategoryForFilter } from "@/redux/services/productService"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { formatCurrency } from "@/utils/currency"
import Link from "next/link"
import { CategoryFilter } from "@/components/products/category-filter"

const statusColors = {
  draft: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  archived: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Action handlers interface
interface ActionHandlers {
  onView: (product: ProductListItem) => void
  onDelete: (product: ProductListItem) => void
  canDelete: boolean
}

// Create columns with action handlers
function createColumns({
  onView,
  onDelete,
  canDelete,
}: ActionHandlers): ColumnDef<ProductListItem>[] {
  return [
    {
      accessorKey: "base_sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      size: 120,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" sortable />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      size: 250,
    },
    {
      accessorKey: "primary_category",
      header: "Category",
      cell: ({ row }) => (
        <span>{row.original.primary_category?.name || "-"}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "min_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Min Price" sortable />
      ),
      cell: ({ row }) => formatCurrency(row.getValue("min_price")),
      size: 120,
    },
    {
      accessorKey: "max_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Max Price" sortable />
      ),
      cell: ({ row }) => formatCurrency(row.getValue("max_price")),
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant="outline"
            className={statusColors[status as keyof typeof statusColors]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(product)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(product)}
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

export function ProductsContent() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryForFilter[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [filteredCount, setFilteredCount] = useState<number>(0)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.PRODUCT.CREATE)
  const canDelete = has(PERMISSIONS.PRODUCT.DELETE)

  // Handle view action - opens in new tab
  const handleView = (product: ProductListItem) => {
    window.open(`/products/${product.id}`, '_blank')
  }

  // Handle delete action
  const handleDelete = (product: ProductListItem) => {
    if (!canDelete) return
    // TODO: Open delete dialog
    console.log("Delete product:", product.id)
  }

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    () =>
      createColumns({
        onView: handleView,
        onDelete: handleDelete,
        canDelete,
      }),
    [canDelete]
  )

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const response = await productService.getForProductsFilter()
      setCategories(response.data.items)
    } catch (err) {
      console.error("Failed to fetch categories for filter:", err)
    }
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const categoryIds = selectedCategory ? [selectedCategory] : undefined
      const response = await productService.getList(categoryIds)
      setProducts(response.data.items)
      // Set initial filtered count to match total items from API
      setFilteredCount(response.data.items.length)
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to fetch products"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  // Clear category filter (used by Reset button)
  const clearCategoryFilter = () => {
    setSelectedCategory("")
  }

  // Category filter options
  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }))
  }, [categories])

  // Check if category filter is active
  const hasCategoryFilter = !!selectedCategory

  // Category filter component
  const categoryFilter = useMemo(() => (
    <CategoryFilter
      options={categoryOptions}
      value={selectedCategory}
      onChange={handleCategoryChange}
      placeholder="Category"
    />
  ), [categoryOptions, selectedCategory])

  // Handle filtered row count change from DataTable
  const handleFilteredCountChange = (count: number) => {
    setFilteredCount(count)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/add-product/jewellery-default">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        )}
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              searchKey="name"
              searchPlaceholder="Search products..."
              showPagination={true}
              maxHeight="400px"
              totalLabel={`Showing: ${filteredCount} product${filteredCount !== 1 ? 's' : ''}`}
              filterComponent={categoryFilter}
              onResetFilters={clearCategoryFilter}
              hasCustomFilter={hasCategoryFilter}
              onFilteredCountChange={handleFilteredCountChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
