'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, X, GripVertical, GitCompareArrows } from 'lucide-react'
import { toast } from 'sonner'
import similarProductsService, { type SimilarProductListItem, type SimilarProductEntry, type ProductForSelection } from '@/redux/services/similarProductsService'

interface SimilarProductsEditDrawerProps {
  product: SimilarProductListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function SimilarProductsEditDrawer({
  product,
  open,
  onOpenChange,
  onSaved,
}: SimilarProductsEditDrawerProps) {
  const [manualPicks, setManualPicks] = useState<SimilarProductEntry[]>([])
  const [systemEntries, setSystemEntries] = useState<SimilarProductEntry[]>([])
  const [allProducts, setAllProducts] = useState<ProductForSelection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [removedSystemIds, setRemovedSystemIds] = useState<string[]>([])
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  useEffect(() => {
    if (open && product) {
      setRemovedSystemIds([])
      fetchSimilarProducts()
      fetchAllProducts()
    }
  }, [open, product?.id])

  const fetchSimilarProducts = async () => {
    if (!product) return
    setIsLoading(true)
    try {
      const response = await similarProductsService.getSimilarProducts(product.id)
      setManualPicks(response.data.manual)
      setSystemEntries(response.data.system)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch similar products')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await similarProductsService.getProductsForSelection()
      setAllProducts(response.data?.items || [])
    } catch {
      // silent fail
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const totalCount = manualPicks.length + systemEntries.length

  const usedProductIds = new Set([
    product?.id,
    ...manualPicks.map((p) => p.product.id),
    ...systemEntries.map((p) => p.product.id),
  ])

  const availableProducts = allProducts.filter((p) => !usedProductIds.has(p.id))

  const handleAddProduct = (sku: string) => {
    if (manualPicks.length >= 10) {
      toast.error('Maximum 10 manual picks allowed')
      return
    }
    const selectedProduct = allProducts.find((p) => p.base_sku === sku)
    if (!selectedProduct) return

    const newEntry: SimilarProductEntry = {
      id: `new_${Date.now()}`,
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        base_sku: selectedProduct.base_sku,
        selling_price: null,
        status: 'active',
      },
      rank: manualPicks.length,
    }
    setManualPicks((prev) => [...prev, newEntry])

    // If total would exceed 10, remove the last system entry to make room
    if (totalCount >= 10 && systemEntries.length > 0) {
      const lastSystem = systemEntries[systemEntries.length - 1]
      setRemovedSystemIds((prev) => [...prev, lastSystem.product.id])
      setSystemEntries((prev) => prev.slice(0, prev.length - 1))
    }
  }

  const handleRemoveManual = (entryId: string) => {
    setManualPicks((prev) => prev.filter((p) => p.id !== entryId))
  }

  const handleRemoveSystem = (entryId: string) => {
    const entry = systemEntries.find((p) => p.id === entryId)
    if (entry) {
      setRemovedSystemIds((prev) => [...prev, entry.product.id])
    }
    setSystemEntries((prev) => prev.filter((p) => p.id !== entryId))
  }

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === idx) return
    setManualPicks((prev) => {
      const items = [...prev]
      const [dragged] = items.splice(draggedIdx, 1)
      items.splice(idx, 0, dragged)
      return items
    })
    setDraggedIdx(idx)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
  }

  const handleSave = async () => {
    if (!product) return
    setIsSaving(true)
    try {
      const manualProductIds = manualPicks.map((p) => p.product.id)
      const response = await similarProductsService.updateManualPicks(product.id, manualProductIds, removedSystemIds)
      toast.success(response.message || 'Manual picks updated')
      setManualPicks(response.data.manual)
      setSystemEntries(response.data.system)
      onSaved()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!isSaving) onOpenChange(value)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <GitCompareArrows className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Similar Products</SheetTitle>
              {product && (
                <p className="text-sm text-muted-foreground">
                  {product.name} ({product.base_sku})
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Manual Picks */}
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Manual Picks ({manualPicks.length}/10)
                </h3>
                {manualPicks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No manual picks added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {manualPicks.map((entry, idx) => (
                      <div
                        key={entry.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className="flex items-center gap-2 rounded-md border p-2 bg-background cursor-move"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{idx + 1}.</span>
                        <span className="text-sm flex-1 truncate">
                          {entry.product.base_sku} — {entry.product.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleRemoveManual(entry.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add product dropdown */}
                {manualPicks.length < 10 && (
                  <div className="mt-3">
                    <Select onValueChange={handleAddProduct} value="">
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingProducts
                              ? 'Loading products...'
                              : availableProducts.length === 0
                                ? 'No more products available'
                                : 'Select a product to add'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((p) => (
                          <SelectItem key={p.id} value={p.base_sku}>
                            {p.base_sku} — {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-t" />

              {/* System Generated */}
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  System Generated ({systemEntries.length})
                </h3>
                {systemEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No system-generated similar products. Run sync to generate.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {systemEntries.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 rounded-md border p-2 bg-muted/30"
                      >
                        <span className="text-sm font-medium">
                          {manualPicks.length + idx + 1}.
                        </span>
                        <span className="text-sm flex-1 truncate">
                          {entry.product.base_sku} — {entry.product.name}
                        </span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Score: {entry.score}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleRemoveSystem(entry.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total summary */}
              <p className="text-sm text-muted-foreground">
                Total: {totalCount}/10 ({manualPicks.length} manual + {systemEntries.length} system)
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
