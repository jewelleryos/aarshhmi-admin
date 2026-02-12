"use client"

import { useState, useEffect } from "react"
import { Loader2, Package } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import productService from "@/redux/services/productService"
import type { ProductVariant } from "@/redux/services/productService"

interface VariantStockEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  variant: ProductVariant | null
  onSuccess: () => void
}

export function VariantStockEditDrawer({
  open,
  onOpenChange,
  productId,
  variant,
  onSuccess,
}: VariantStockEditDrawerProps) {
  const [stockQuantity, setStockQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when variant changes or drawer opens
  useEffect(() => {
    if (open && variant) {
      setStockQuantity((variant.stock_quantity ?? 0).toString())
      setError(null)
    }
  }, [open, variant])

  const handleSubmit = async () => {
    if (!variant) return

    const quantity = parseInt(stockQuantity)

    if (isNaN(quantity) || quantity < 0) {
      setError("Stock quantity must be a non-negative number")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await productService.updateVariantStock(
        productId,
        variant.id,
        { stock_quantity: quantity }
      )
      toast.success(response.message)
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="sm:max-w-md flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Stock Quantity</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {variant ? (
                  <>
                    SKU: <span className="font-mono">{variant.sku.toUpperCase()}</span>
                  </>
                ) : (
                  "Update variant stock quantity"
                )}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stock">
              Stock Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(e) => {
                setStockQuantity(e.target.value)
                setError(null)
              }}
              placeholder="Enter stock quantity"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
