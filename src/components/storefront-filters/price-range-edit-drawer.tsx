"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { IndianRupee, Loader2 } from "lucide-react"
import { toast } from "sonner"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type { PriceFilterRange } from "@/redux/services/storefrontFiltersService"

interface PriceRangeEditDrawerProps {
  priceRange: PriceFilterRange | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PriceRangeEditDrawer({
  priceRange,
  open,
  onOpenChange,
}: PriceRangeEditDrawerProps) {
  // Form state
  const [displayName, setDisplayName] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [rank, setRank] = useState("0")
  const [status, setStatus] = useState(true)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    display_name?: string
    min_price?: string
    max_price?: string
  }>({})

  // Populate form when drawer opens
  useEffect(() => {
    if (priceRange && open) {
      setDisplayName(priceRange.display_name)
      // Convert paise to rupees for display
      setMinPrice(String(priceRange.min_price / 100))
      setMaxPrice(String(priceRange.max_price / 100))
      setRank(String(priceRange.rank))
      setStatus(priceRange.status)
      setErrors({})
    }
  }, [priceRange, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!priceRange) return

    // Validate
    const newErrors: typeof errors = {}

    if (!displayName.trim()) {
      newErrors.display_name = "Display name is required"
    }

    const minPriceNum = parseFloat(minPrice)
    const maxPriceNum = parseFloat(maxPrice)

    if (!minPrice || isNaN(minPriceNum) || minPriceNum < 0) {
      newErrors.min_price = "Min price is required and must be 0 or greater"
    }

    if (!maxPrice || isNaN(maxPriceNum) || maxPriceNum <= 0) {
      newErrors.max_price = "Max price is required and must be greater than 0"
    }

    if (!newErrors.min_price && !newErrors.max_price && maxPriceNum <= minPriceNum) {
      newErrors.max_price = "Max price must be greater than min price"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      // Convert rupees to paise
      const minPricePaise = Math.round(minPriceNum * 100)
      const maxPricePaise = Math.round(maxPriceNum * 100)

      const response = await storefrontFiltersService.updatePriceRange(priceRange.id, {
        display_name: displayName.trim(),
        min_price: minPricePaise,
        max_price: maxPricePaise,
        rank: parseInt(rank) || 0,
        status,
      })

      toast.success(response.message)
      onOpenChange(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to update price range"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
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
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Price Range</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {priceRange?.display_name || "Update price range settings"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-displayName"
              placeholder='e.g., "Under 20,000" or "20,000 - 50,000"'
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                if (errors.display_name && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, display_name: undefined }))
                }
              }}
              maxLength={100}
            />
            {errors.display_name && (
              <p className="text-sm text-destructive pl-1.25">{errors.display_name}</p>
            )}
          </div>

          {/* Min Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-minPrice">
              Min Price (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-minPrice"
              type="number"
              min={0}
              placeholder="e.g., 0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value)
                if (errors.min_price) {
                  setErrors((prev) => ({ ...prev, min_price: undefined }))
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter price in rupees (e.g., 20000 for ₹20,000)
            </p>
            {errors.min_price && (
              <p className="text-sm text-destructive pl-1.25">{errors.min_price}</p>
            )}
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-maxPrice">
              Max Price (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-maxPrice"
              type="number"
              min={1}
              placeholder="e.g., 20000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value)
                if (errors.max_price) {
                  setErrors((prev) => ({ ...prev, max_price: undefined }))
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter price in rupees (e.g., 50000 for ₹50,000)
            </p>
            {errors.max_price && (
              <p className="text-sm text-destructive pl-1.25">{errors.max_price}</p>
            )}
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="edit-rank">Display Order</Label>
            <Input
              id="edit-rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the price filter list
            </p>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="edit-status" className="cursor-pointer">
              Active
            </Label>
          </div>

        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
