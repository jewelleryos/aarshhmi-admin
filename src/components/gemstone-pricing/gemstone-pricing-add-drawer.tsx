"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IndianRupee, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createGemstonePrice } from "@/redux/slices/gemstonePricingSlice"
import { DropdownItem } from "@/redux/services/gemstonePricingService"
import { toSmallestUnit } from "@/utils/currency"
import { toast } from "sonner"

interface GemstonePricingAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gemstoneTypes: DropdownItem[]
  shapes: DropdownItem[]
  qualities: DropdownItem[]
  colors: DropdownItem[]
}

export function GemstonePricingAddDrawer({
  open,
  onOpenChange,
  gemstoneTypes,
  shapes,
  qualities,
  colors,
}: GemstonePricingAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [typeId, setTypeId] = useState("")
  const [shapeId, setShapeId] = useState("")
  const [qualityId, setQualityId] = useState("")
  const [colorId, setColorId] = useState("")
  const [ctFrom, setCtFrom] = useState("")
  const [ctTo, setCtTo] = useState("")
  const [price, setPrice] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    typeId?: string
    shapeId?: string
    qualityId?: string
    colorId?: string
    ctFrom?: string
    ctTo?: string
    price?: string
  }>({})

  // Reset form
  const resetForm = () => {
    setTypeId("")
    setShapeId("")
    setQualityId("")
    setColorId("")
    setCtFrom("")
    setCtTo("")
    setPrice("")
    setErrors({})
  }

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate
    const newErrors: typeof errors = {}

    if (!typeId) {
      newErrors.typeId = "Gemstone type is required"
    }
    if (!shapeId) {
      newErrors.shapeId = "Shape is required"
    }
    if (!qualityId) {
      newErrors.qualityId = "Quality is required"
    }
    if (!colorId) {
      newErrors.colorId = "Color is required"
    }
    if (!ctFrom) {
      newErrors.ctFrom = "Carat from is required"
    } else if (parseFloat(ctFrom) < 0) {
      newErrors.ctFrom = "Carat must be non-negative"
    }
    if (!ctTo) {
      newErrors.ctTo = "Carat to is required"
    } else if (parseFloat(ctTo) <= 0) {
      newErrors.ctTo = "Carat to must be greater than 0"
    }
    if (ctFrom && ctTo && parseFloat(ctFrom) >= parseFloat(ctTo)) {
      newErrors.ctFrom = "Carat from must be less than carat to"
    }
    if (!price) {
      newErrors.price = "Price is required"
    } else if (parseFloat(price) < 0) {
      newErrors.price = "Price must be non-negative"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        createGemstonePrice({
          stone_type_id: typeId,
          stone_shape_id: shapeId,
          stone_quality_id: qualityId,
          stone_color_id: colorId,
          ct_from: parseFloat(ctFrom),
          ct_to: parseFloat(ctTo),
          price: toSmallestUnit(parseFloat(price)),
          status: true,
        })
      ).unwrap()

      toast.success("Gemstone price created successfully")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error(err as string)
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
              <SheetTitle>Add Gemstone Price</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new pricing entry for gemstones
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Gemstone Type Field */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Gemstone Type <span className="text-destructive">*</span>
            </Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select gemstone type" />
              </SelectTrigger>
              <SelectContent>
                {gemstoneTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeId && (
              <p className="text-sm text-destructive pl-[5px]">{errors.typeId}</p>
            )}
          </div>

          {/* Shape Field */}
          <div className="space-y-2">
            <Label htmlFor="shape">
              Shape <span className="text-destructive">*</span>
            </Label>
            <Select value={shapeId} onValueChange={setShapeId}>
              <SelectTrigger id="shape">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                {shapes.map((shape) => (
                  <SelectItem key={shape.id} value={shape.id}>
                    {shape.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.shapeId && (
              <p className="text-sm text-destructive pl-[5px]">{errors.shapeId}</p>
            )}
          </div>

          {/* Quality Field */}
          <div className="space-y-2">
            <Label htmlFor="quality">
              Quality <span className="text-destructive">*</span>
            </Label>
            <Select value={qualityId} onValueChange={setQualityId}>
              <SelectTrigger id="quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {qualities.map((quality) => (
                  <SelectItem key={quality.id} value={quality.id}>
                    {quality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.qualityId && (
              <p className="text-sm text-destructive pl-[5px]">{errors.qualityId}</p>
            )}
          </div>

          {/* Color Field */}
          <div className="space-y-2">
            <Label htmlFor="color">
              Color <span className="text-destructive">*</span>
            </Label>
            <Select value={colorId} onValueChange={setColorId}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.colorId && (
              <p className="text-sm text-destructive pl-[5px]">{errors.colorId}</p>
            )}
          </div>

          {/* Carat Range */}
          <div className="grid grid-cols-2 gap-4">
            {/* Carat From */}
            <div className="space-y-2">
              <Label htmlFor="ctFrom">
                Carat From <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ctFrom"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={ctFrom}
                onChange={(e) => {
                  setCtFrom(e.target.value)
                  if (errors.ctFrom) {
                    setErrors((prev) => ({ ...prev, ctFrom: undefined }))
                  }
                }}
              />
              {errors.ctFrom && (
                <p className="text-sm text-destructive pl-[5px]">{errors.ctFrom}</p>
              )}
            </div>

            {/* Carat To */}
            <div className="space-y-2">
              <Label htmlFor="ctTo">
                Carat To <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ctTo"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={ctTo}
                onChange={(e) => {
                  setCtTo(e.target.value)
                  if (errors.ctTo) {
                    setErrors((prev) => ({ ...prev, ctTo: undefined }))
                  }
                }}
              />
              {errors.ctTo && (
                <p className="text-sm text-destructive pl-[5px]">{errors.ctTo}</p>
              )}
            </div>
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price per Carat <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  if (errors.price) {
                    setErrors((prev) => ({ ...prev, price: undefined }))
                  }
                }}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-destructive pl-[5px]">{errors.price}</p>
            )}
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
                Creating...
              </>
            ) : (
              "Create Price"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
