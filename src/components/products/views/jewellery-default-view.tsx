"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Check, X, MoreVertical, Eye, ArrowRight, ImageIcon, Pencil, ChevronDown, Loader2, Package } from "lucide-react"
import { toast } from "sonner"
import { BasicDetailsEditDrawer } from "@/components/products/edit/basic-details-edit-drawer"
import { AttributesEditDrawer } from "@/components/products/edit/attributes-edit-drawer"
import { SeoEditDrawer } from "@/components/products/edit/seo-edit-drawer"
import { MediaEditDrawer } from "@/components/products/edit/media-edit-drawer"
import { VariantStockEditDrawer } from "@/components/products/edit/variant-stock-edit-drawer"
import { getCdnUrl } from "@/utils/cdn"
import productService from "@/redux/services/productService"
import type { ProductDetail, ProductVariant } from "@/redux/services/productService"
import { formatCurrency } from "@/utils/currency"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"

interface JewelleryDefaultViewProps {
  product: ProductDetail
  onProductUpdate?: () => void
}

// OptionConfig types from product.metadata
interface OptionConfigItem {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  imageAltText: string | null
}

interface OptionConfig {
  metalTypes: OptionConfigItem[]
  metalColors: (OptionConfigItem & { metalTypeId: string })[]
  metalPurities: (OptionConfigItem & { metalTypeId: string })[]
  diamondClarityColors: OptionConfigItem[] | null
  gemstoneColors: OptionConfigItem[] | null
}

// Media types from product.metadata
interface MediaItem {
  id: string
  path: string
  type: string
  altText: string | null
  position: number
}

interface GemstoneSubMedia {
  gemstoneColorId: string
  items: MediaItem[]
}

interface ColorMedia {
  metalColorId: string
  items: MediaItem[]
  gemstoneSubMedia: GemstoneSubMedia[]
}

interface ProductMedia {
  colorMedia: ColorMedia[]
}

// Price components type from variant
interface PriceComponent {
  metalPrice: number
  makingCharge: number
  diamondPrice: number
  gemstonePrice: number
  pearlPrice: number
  finalPriceWithoutTax: number
  taxAmount: number
  finalPriceWithTax: number
  taxIncluded: boolean
  finalPrice: number
}

interface PriceComponents {
  costPrice: PriceComponent
  sellingPrice: PriceComponent
  compareAtPrice: PriceComponent
}

const statusColors = {
  draft: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  inactive: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  archived: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Get name from optionConfig by ID
function getOptionName(
  optionConfig: OptionConfig | undefined,
  optionType: keyof OptionConfig,
  id: string | undefined | null
): string {
  if (!optionConfig || !id) return "-"

  const items = optionConfig[optionType]
  if (!items || !Array.isArray(items)) return "-"

  const item = items.find((i) => i.id === id)
  return item?.name || "-"
}

// Calculate difference and percentage
function calculateDifference(cost: number, selling: number): { amount: number; percentage: number } {
  const amount = selling - cost
  const percentage = cost > 0 ? (amount / cost) * 100 : 0
  return { amount, percentage }
}

// Variant Detail Modal Component
function VariantDetailModal({
  variant,
  optionConfig,
  productName,
  open,
  onOpenChange,
}: {
  variant: ProductVariant
  optionConfig: OptionConfig | undefined
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const priceComponents = variant.price_components as unknown as PriceComponents | undefined
  const metadata = variant.metadata as Record<string, unknown> | undefined

  // Get option names
  const metalTypeName = getOptionName(optionConfig, "metalTypes", metadata?.metalType as string)
  const metalColorName = getOptionName(optionConfig, "metalColors", metadata?.metalColor as string)
  const metalPurityName = getOptionName(optionConfig, "metalPurities", metadata?.metalPurity as string)
  const diamondName = getOptionName(optionConfig, "diamondClarityColors", metadata?.diamondClarityColor as string)
  const gemstoneName = getOptionName(optionConfig, "gemstoneColors", metadata?.gemstoneColor as string)

  // Get weights
  const weights = metadata?.weights as {
    metal?: { grams: number }
    diamond?: { carat: number; grams: number; stoneCount: number }
    gemstone?: { carat: number; grams: number; stoneCount: number }
    pearl?: { grams: number; count: number }
    total?: { grams: number }
  } | undefined

  // Price summary calculations
  const costPrice = priceComponents?.costPrice?.finalPrice || variant.cost_price || 0
  const sellingPrice = priceComponents?.sellingPrice?.finalPrice || variant.price || 0
  const compareAtPrice = priceComponents?.compareAtPrice?.finalPrice || variant.compare_at_price || 0
  const priceDiff = calculateDifference(costPrice, sellingPrice)

  // Check if has stones
  const hasDiamond = diamondName !== "-" && priceComponents?.costPrice?.diamondPrice !== undefined
  const hasGemstone = gemstoneName !== "-" && priceComponents?.costPrice?.gemstonePrice !== undefined
  const hasPearl = priceComponents?.costPrice?.pearlPrice !== undefined && priceComponents.costPrice.pearlPrice > 0

  // Calculate stone price totals
  const stoneCostPrice = (priceComponents?.costPrice?.diamondPrice || 0) +
    (priceComponents?.costPrice?.gemstonePrice || 0) +
    (priceComponents?.costPrice?.pearlPrice || 0)
  const stoneSellingPrice = (priceComponents?.sellingPrice?.diamondPrice || 0) +
    (priceComponents?.sellingPrice?.gemstonePrice || 0) +
    (priceComponents?.sellingPrice?.pearlPrice || 0)
  const stoneCompareAtPrice = (priceComponents?.compareAtPrice?.diamondPrice || 0) +
    (priceComponents?.compareAtPrice?.gemstonePrice || 0) +
    (priceComponents?.compareAtPrice?.pearlPrice || 0)
  const stoneDiff = calculateDifference(stoneCostPrice, stoneSellingPrice)

  // Making charge diff
  const makingChargeDiff = calculateDifference(
    priceComponents?.costPrice?.makingCharge || 0,
    priceComponents?.sellingPrice?.makingCharge || 0
  )

  // Subtotal diff
  const subtotalDiff = calculateDifference(
    priceComponents?.costPrice?.finalPriceWithoutTax || 0,
    priceComponents?.sellingPrice?.finalPriceWithoutTax || 0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{productName}</DialogTitle>
          <p className="text-sm text-muted-foreground font-mono">{variant.sku.toUpperCase()}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Product Summary */}
          <Card>
            <CardHeader className="">
              <CardTitle className="text-base">Product Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metal Details */}
                <div>
                  <h4 className="font-medium mb-3">Metal Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{metalTypeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color</span>
                      <span>{metalColorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purity</span>
                      <span>{metalPurityName}</span>
                    </div>
                    {weights?.metal && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight</span>
                        <span>{weights.metal.grams.toFixed(2)} g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stone Details */}
                {(hasDiamond || hasGemstone || hasPearl) && (
                  <div>
                    <h4 className="font-medium mb-3">Stone Details</h4>
                    <div className="space-y-3 text-sm">
                      {hasDiamond && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium mb-1">Diamond</div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Clarity/Color</span>
                            <span className="text-foreground">{diamondName}</span>
                          </div>
                          {weights?.diamond && (
                            <>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Pieces</span>
                                <span className="text-foreground">{weights.diamond.stoneCount}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Carat</span>
                                <span className="text-foreground">{weights.diamond.carat.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {hasGemstone && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium mb-1">Gemstone</div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Color</span>
                            <span className="text-foreground">{gemstoneName}</span>
                          </div>
                          {weights?.gemstone && (
                            <>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Pieces</span>
                                <span className="text-foreground">{weights.gemstone.stoneCount}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Carat</span>
                                <span className="text-foreground">{weights.gemstone.carat.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {hasPearl && weights?.pearl && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium mb-1">Pearl</div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Count</span>
                            <span className="text-foreground">{weights.pearl.count}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Weight</span>
                            <span className="text-foreground">{weights.pearl.grams.toFixed(2)} g</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price Impact Summary */}
          <Card>
            <CardHeader className="">
              <CardTitle className="text-base">Price Impact Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="text-xl font-semibold">{formatCurrency(costPrice)}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Selling Price</p>
                  <p className="text-xl font-semibold">{formatCurrency(sellingPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Difference</p>
                  <p className={`text-xl font-semibold ${priceDiff.amount >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {formatCurrency(priceDiff.amount)} ({priceDiff.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Price Breakdown */}
          {priceComponents && (
            <div>
              <h3 className="font-medium mb-3">Final Price Breakdown</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead className="text-right">Sell Price</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Metal Price */}
                    <TableRow>
                      <TableCell>Metal Price</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.costPrice.metalPrice)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">No change</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.sellingPrice.metalPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.compareAtPrice.metalPrice)}
                      </TableCell>
                    </TableRow>

                    {/* Making Charge */}
                    <TableRow>
                      <TableCell>Making Charges + Other Charges</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.costPrice.makingCharge)}
                      </TableCell>
                      <TableCell className="text-right">
                        {makingChargeDiff.amount !== 0 ? (
                          <span className="text-emerald-600">
                            {formatCurrency(makingChargeDiff.amount)} ({makingChargeDiff.percentage.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No change</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.sellingPrice.makingCharge)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.compareAtPrice.makingCharge)}
                      </TableCell>
                    </TableRow>

                    {/* Stone Price */}
                    <TableRow>
                      <TableCell>Stone Price</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(stoneCostPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {stoneDiff.amount !== 0 ? (
                          <span className="text-emerald-600">
                            {formatCurrency(stoneDiff.amount)} ({stoneDiff.percentage.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No change</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(stoneSellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(stoneCompareAtPrice)}
                      </TableCell>
                    </TableRow>

                    {/* Subtotal */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">Subtotal</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(priceComponents.costPrice.finalPriceWithoutTax)}
                      </TableCell>
                      <TableCell className="text-right">
                        {subtotalDiff.amount !== 0 ? (
                          <span className="text-emerald-600 font-medium">
                            {formatCurrency(subtotalDiff.amount)} ({subtotalDiff.percentage.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No change</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(priceComponents.sellingPrice.finalPriceWithoutTax)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(priceComponents.compareAtPrice.finalPriceWithoutTax)}
                      </TableCell>
                    </TableRow>

                    {/* GST */}
                    {priceComponents.costPrice.taxIncluded && (
                      <TableRow>
                        <TableCell>GST (3%)</TableCell>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(priceComponents.sellingPrice.taxAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(priceComponents.compareAtPrice.taxAmount)}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Final Price */}
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell>Final Price</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.costPrice.finalPrice)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">-</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.sellingPrice.finalPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(priceComponents.compareAtPrice.finalPrice)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Create variant table columns with optionConfig for name lookups
function createVariantColumns(
  optionConfig: OptionConfig | undefined,
  onViewVariant: (variant: ProductVariant) => void,
  onEditStock: (variant: ProductVariant) => void
): ColumnDef<ProductVariant>[] {
  return [
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" sortable />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium font-mono text-sm">{row.original.sku.toUpperCase()}</span>
          {row.original.is_default && (
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          )}
        </div>
      ),
      size: 200,
    },
    {
      id: "metal_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Metal Type" />
      ),
      cell: ({ row }) => {
        const metalTypeId = row.original.metadata?.metalType as string | undefined
        return (
          <span className="text-sm">
            {getOptionName(optionConfig, "metalTypes", metalTypeId)}
          </span>
        )
      },
      size: 100,
    },
    {
      id: "metal_color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Metal Color" />
      ),
      cell: ({ row }) => {
        const metalColorId = row.original.metadata?.metalColor as string | undefined
        return (
          <span className="text-sm">
            {getOptionName(optionConfig, "metalColors", metalColorId)}
          </span>
        )
      },
      size: 110,
    },
    {
      id: "metal_purity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purity" />
      ),
      cell: ({ row }) => {
        const metalPurityId = row.original.metadata?.metalPurity as string | undefined
        return (
          <span className="text-sm">
            {getOptionName(optionConfig, "metalPurities", metalPurityId)}
          </span>
        )
      },
      size: 80,
    },
    {
      id: "diamond_clarity_color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Diamond" />
      ),
      cell: ({ row }) => {
        const diamondClarityColorId = row.original.metadata?.diamondClarityColor as string | undefined
        return (
          <span className="text-sm">
            {getOptionName(optionConfig, "diamondClarityColors", diamondClarityColorId)}
          </span>
        )
      },
      size: 90,
    },
    {
      id: "gemstone_color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gemstone" />
      ),
      cell: ({ row }) => {
        const gemstoneColorId = row.original.metadata?.gemstoneColor as string | undefined
        return (
          <span className="text-sm">
            {getOptionName(optionConfig, "gemstoneColors", gemstoneColorId)}
          </span>
        )
      },
      size: 90,
    },
    {
      accessorKey: "cost_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cost Price" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.cost_price ? formatCurrency(row.original.cost_price) : "-"}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Selling Price" sortable />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.price)}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "compare_at_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Compare At" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.compare_at_price
            ? formatCurrency(row.original.compare_at_price)
            : "-"}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "is_available",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Available" />
      ),
      cell: ({ row }) =>
        row.original.is_available ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <X className="h-4 w-4 text-destructive" />
        ),
      size: 80,
    },
    {
      accessorKey: "stock_quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" sortable />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.stock_quantity ?? 0}</span>
      ),
      size: 80,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewVariant(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditStock(row.original)}>
                <Package className="mr-2 h-4 w-4" />
                Edit Stock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
  ]
}

export function JewelleryDefaultView({ product, onProductUpdate }: JewelleryDefaultViewProps) {
  const router = useRouter()
  const { has } = usePermissions()
  const canUpdateStatus = has(PERMISSIONS.PRODUCT.UPDATE_STATUS)

  // State for variant detail modal
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // State for edit basic details drawer
  const [isEditBasicDrawerOpen, setIsEditBasicDrawerOpen] = useState(false)

  // State for edit attributes drawer
  const [isEditAttributesDrawerOpen, setIsEditAttributesDrawerOpen] = useState(false)

  // State for edit SEO drawer
  const [isEditSeoDrawerOpen, setIsEditSeoDrawerOpen] = useState(false)

  // State for edit media drawer
  const [isEditMediaDrawerOpen, setIsEditMediaDrawerOpen] = useState(false)

  // State for status update
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  // State for stock edit drawer
  const [stockEditVariant, setStockEditVariant] = useState<ProductVariant | null>(null)
  const [isStockEditDrawerOpen, setIsStockEditDrawerOpen] = useState(false)

  // Get optionConfig from product metadata
  const optionConfig = product.metadata?.optionConfig as OptionConfig | undefined

  // Handle view variant
  const handleViewVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setIsModalOpen(true)
  }

  // Handle edit stock
  const handleEditStock = (variant: ProductVariant) => {
    setStockEditVariant(variant)
    setIsStockEditDrawerOpen(true)
  }

  // Handle status change
  const handleStatusChange = async (newStatus: "draft" | "inactive" | "active" | "archived") => {
    if (newStatus === product.status) return

    setIsStatusUpdating(true)
    try {
      const response = await productService.updateStatus(product.id, { status: newStatus })
      toast.success(response.message)
      onProductUpdate?.()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsStatusUpdating(false)
    }
  }

  // Memoize variant columns with optionConfig dependency
  const variantColumns = useMemo(
    () => createVariantColumns(optionConfig, handleViewVariant, handleEditStock),
    [optionConfig]
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            {canUpdateStatus ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isStatusUpdating}>
                  <Button
                    variant="outline"
                    className={cn(
                      "gap-2 h-7 text-xs",
                      statusColors[product.status as keyof typeof statusColors]
                    )}
                  >
                    {isStatusUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(["draft", "inactive", "active", "archived"] as const).map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={product.status === status}
                      className="gap-2"
                    >
                      <Badge
                        variant="outline"
                        className={cn("text-xs", statusColors[status])}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                      {product.status === status && <Check className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge
                variant="outline"
                className={statusColors[product.status as keyof typeof statusColors]}
              >
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            SKU: {product.base_sku} {product.style_sku && `| Style: ${product.style_sku}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Price Range</p>
          <p className="text-lg font-semibold">
            {formatCurrency(product.min_price)} - {formatCurrency(product.max_price)}
          </p>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Basic Information</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditBasicDrawerOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Product Type</p>
              <p className="font-medium">{product.product_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Variants</p>
              <p className="font-medium">{product.variant_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="font-medium">{product.slug}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(product.created_at)}</p>
            </div>
          </div>

          {/* Dimensions, Engraving, Size Chart */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Dimensions</p>
              <p className="font-medium">
                {(() => {
                  const metadata = product.metadata as { dimensions?: { width: number; height: number; length: number } }
                  if (metadata?.dimensions) {
                    return `${metadata.dimensions.width} × ${metadata.dimensions.height} × ${metadata.dimensions.length} mm`
                  }
                  return "-"
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engraving</p>
              <p className="font-medium">
                {(() => {
                  const metadata = product.metadata as { engraving?: { hasEngraving: boolean; maxCharacters?: number } }
                  if (metadata?.engraving?.hasEngraving) {
                    return `Yes (max ${metadata.engraving.maxCharacters} chars)`
                  }
                  return "No"
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size Chart</p>
              <p className="font-medium">
                {(() => {
                  const metadata = product.metadata as { sizeChart?: { hasSizeChart: boolean; sizeChartGroupId?: string } }
                  if (metadata?.sizeChart?.hasSizeChart) {
                    return "Yes"
                  }
                  return "No"
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Style SKU</p>
              <p className="font-medium">{product.style_sku || "-"}</p>
            </div>
          </div>

          {product.short_description && (
            <div>
              <p className="text-sm text-muted-foreground">Short Description</p>
              <p className="font-medium">{product.short_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Details Edit Drawer */}
      <BasicDetailsEditDrawer
        open={isEditBasicDrawerOpen}
        onOpenChange={setIsEditBasicDrawerOpen}
        product={product}
        onSuccess={() => onProductUpdate?.()}
      />

      <AttributesEditDrawer
        open={isEditAttributesDrawerOpen}
        onOpenChange={setIsEditAttributesDrawerOpen}
        product={product}
        onSuccess={() => onProductUpdate?.()}
      />

      <SeoEditDrawer
        open={isEditSeoDrawerOpen}
        onOpenChange={setIsEditSeoDrawerOpen}
        product={product}
        onSuccess={() => onProductUpdate?.()}
      />

      <MediaEditDrawer
        open={isEditMediaDrawerOpen}
        onOpenChange={setIsEditMediaDrawerOpen}
        product={product}
        onSuccess={() => onProductUpdate?.()}
      />

      <VariantStockEditDrawer
        open={isStockEditDrawerOpen}
        onOpenChange={setIsStockEditDrawerOpen}
        productId={product.id}
        variant={stockEditVariant}
        onSuccess={() => onProductUpdate?.()}
      />

      {/* Attributes - Categories, Tags & Badges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Attributes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditAttributesDrawerOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Categories */}
          <div className="flex items-start gap-4">
            <span className="text-sm text-muted-foreground w-24 shrink-0">Categories</span>
            <div className="flex flex-wrap gap-2">
              {product.categories.length > 0 ? (
                product.categories.map((category) => (
                  <Badge key={category.id} variant={category.is_primary ? "default" : "outline"}>
                    {category.name}
                    {category.is_primary && " (Primary)"}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No categories assigned</span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-start gap-4">
            <span className="text-sm text-muted-foreground w-24 shrink-0">Tags</span>
            <div className="flex flex-wrap gap-2">
              {product.tags.length > 0 ? (
                product.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.tag_group_name}: {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags assigned</span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-start gap-4">
            <span className="text-sm text-muted-foreground w-24 shrink-0">Badges</span>
            <div className="flex flex-wrap gap-2">
              {product.badges.length > 0 ? (
                product.badges.map((badge) => (
                  <Badge
                    key={badge.id}
                    style={{
                      backgroundColor: badge.bg_color,
                      color: badge.font_color,
                    }}
                  >
                    {badge.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No badges assigned</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Options */}
      {optionConfig && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Product Options</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/products/${product.id}/edit-options`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Options
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metal Types */}
            {optionConfig.metalTypes && optionConfig.metalTypes.length > 0 && (
              <div className="flex items-start gap-4">
                <span className="text-sm text-muted-foreground w-32 shrink-0">Metal Types</span>
                <div className="flex flex-wrap gap-2">
                  {optionConfig.metalTypes.map((item) => (
                    <Badge key={item.id} variant="outline">
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metal Colors */}
            {optionConfig.metalColors && optionConfig.metalColors.length > 0 && (
              <div className="flex items-start gap-4">
                <span className="text-sm text-muted-foreground w-32 shrink-0">Metal Colors</span>
                <div className="flex flex-wrap gap-2">
                  {optionConfig.metalColors.map((item) => (
                    <Badge key={item.id} variant="outline">
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metal Purities */}
            {optionConfig.metalPurities && optionConfig.metalPurities.length > 0 && (
              <div className="flex items-start gap-4">
                <span className="text-sm text-muted-foreground w-32 shrink-0">Metal Purities</span>
                <div className="flex flex-wrap gap-2">
                  {optionConfig.metalPurities.map((item) => (
                    <Badge key={item.id} variant="outline">
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Diamond Clarity Colors */}
            <div className="flex items-start gap-4">
              <span className="text-sm text-muted-foreground w-32 shrink-0">Diamond Clarity</span>
              <div className="flex flex-wrap gap-2">
                {optionConfig.diamondClarityColors && optionConfig.diamondClarityColors.length > 0 ? (
                  optionConfig.diamondClarityColors.map((item) => (
                    <Badge key={item.id} variant="outline">
                      {item.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No diamond options added</span>
                )}
              </div>
            </div>

            {/* Gemstone Colors */}
            <div className="flex items-start gap-4">
              <span className="text-sm text-muted-foreground w-32 shrink-0">Gemstone Colors</span>
              <div className="flex flex-wrap gap-2">
                {optionConfig.gemstoneColors && optionConfig.gemstoneColors.length > 0 ? (
                  optionConfig.gemstoneColors.map((item) => (
                    <Badge key={item.id} variant="outline">
                      {item.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No gemstone options added</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Section */}
      {(() => {
        const media = product.metadata?.media as ProductMedia | undefined
        const hasMedia = media?.colorMedia && media.colorMedia.length > 0

        if (!hasMedia) {
          return (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Media</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMediaDrawerOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No media added</p>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Media</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMediaDrawerOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={media.colorMedia[0]?.metalColorId} className="w-full">
                <TabsList className="mb-4">
                  {media.colorMedia.map((colorMedia) => {
                    const metalColor = optionConfig?.metalColors.find(
                      (mc) => mc.id === colorMedia.metalColorId
                    )
                    return (
                      <TabsTrigger key={colorMedia.metalColorId} value={colorMedia.metalColorId}>
                        {metalColor?.name || colorMedia.metalColorId}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {media.colorMedia.map((colorMedia) => {
                  const hasGemstoneMedia = colorMedia.gemstoneSubMedia && colorMedia.gemstoneSubMedia.length > 0

                  return (
                    <TabsContent key={colorMedia.metalColorId} value={colorMedia.metalColorId}>
                      {hasGemstoneMedia ? (
                        <Tabs defaultValue="main" className="w-full">
                          <TabsList className="mb-4">
                            <TabsTrigger value="main">Main</TabsTrigger>
                            {colorMedia.gemstoneSubMedia.map((gemMedia) => {
                              const gemstoneColor = optionConfig?.gemstoneColors?.find(
                                (gc) => gc.id === gemMedia.gemstoneColorId
                              )
                              return (
                                <TabsTrigger key={gemMedia.gemstoneColorId} value={gemMedia.gemstoneColorId}>
                                  {gemstoneColor?.name || gemMedia.gemstoneColorId}
                                </TabsTrigger>
                              )
                            })}
                          </TabsList>

                          {/* Main media items */}
                          <TabsContent value="main">
                            {colorMedia.items.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {colorMedia.items
                                  .sort((a, b) => a.position - b.position)
                                  .map((item) => (
                                    <div
                                      key={item.id}
                                      className="relative aspect-square rounded-lg border bg-muted/50 overflow-hidden"
                                    >
                                      {item.type.startsWith("image") ? (
                                        <img
                                          src={getCdnUrl(item.path) || item.path}
                                          alt={item.altText || "Product image"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No main media added</p>
                            )}
                          </TabsContent>

                          {/* Gemstone sub-media */}
                          {colorMedia.gemstoneSubMedia.map((gemMedia) => (
                            <TabsContent key={gemMedia.gemstoneColorId} value={gemMedia.gemstoneColorId}>
                              {gemMedia.items.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                  {gemMedia.items
                                    .sort((a, b) => a.position - b.position)
                                    .map((item) => (
                                      <div
                                        key={item.id}
                                        className="relative aspect-square rounded-lg border bg-muted/50 overflow-hidden"
                                      >
                                        {item.type.startsWith("image") ? (
                                          <img
                                            src={getCdnUrl(item.path) || item.path}
                                            alt={item.altText || "Product image"}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No media added for this gemstone color</p>
                              )}
                            </TabsContent>
                          ))}
                        </Tabs>
                      ) : (
                        // No gemstone sub-media, just show main items
                        colorMedia.items.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {colorMedia.items
                              .sort((a, b) => a.position - b.position)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="relative aspect-square rounded-lg border bg-muted/50 overflow-hidden"
                                >
                                  {item.type.startsWith("image") ? (
                                    <img
                                      src={getCdnUrl(item.path) || item.path}
                                      alt={item.altText || "Product image"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No media added for this color</p>
                        )
                      )}
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>
        )
      })()}

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Variants ({product.variants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={variantColumns}
            data={product.variants}
            searchKey="sku"
            searchPlaceholder="Search by SKU..."
            showPagination={false}
            maxHeight="600px"
          />
        </CardContent>
      </Card>

      {/* SEO Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>SEO</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditSeoDrawerOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(() => {
            const seo = product.seo as Record<string, string> | undefined
            return (
              <>
                {/* Meta Tags */}
                <div>
                  <h4 className="font-medium mb-3">Meta Tags</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Meta Title</span>
                      <span className="text-sm">{seo?.meta_title || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Meta Description</span>
                      <span className="text-sm">{seo?.meta_description || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Meta Keywords</span>
                      <span className="text-sm">{seo?.meta_keywords || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Meta Robots</span>
                      <span className="text-sm">{seo?.meta_robots || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Canonical URL</span>
                      <span className="text-sm">{seo?.meta_canonical || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Open Graph Tags */}
                <div>
                  <h4 className="font-medium mb-3">Open Graph Tags</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">OG Title</span>
                      <span className="text-sm">{seo?.og_title || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">OG Site Name</span>
                      <span className="text-sm">{seo?.og_site_name || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">OG Description</span>
                      <span className="text-sm">{seo?.og_description || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">OG URL</span>
                      <span className="text-sm">{seo?.og_url || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">OG Image URL</span>
                      <span className="text-sm">{seo?.og_image_url || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Twitter Tags */}
                <div>
                  <h4 className="font-medium mb-3">Twitter Card</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Twitter Title</span>
                      <span className="text-sm">{seo?.twitter_card_title || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Twitter Site Name</span>
                      <span className="text-sm">{seo?.twitter_card_site_name || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Twitter Description</span>
                      <span className="text-sm">{seo?.twitter_card_description || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Twitter URL</span>
                      <span className="text-sm">{seo?.twitter_url || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-sm text-muted-foreground">Twitter Media</span>
                      <span className="text-sm">{seo?.twitter_media || "-"}</span>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </CardContent>
      </Card>

      {/* Variant Detail Modal */}
      {selectedVariant && (
        <VariantDetailModal
          variant={selectedVariant}
          optionConfig={optionConfig}
          productName={product.name}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  )
}
