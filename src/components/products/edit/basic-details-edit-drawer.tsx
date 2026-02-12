"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchSizeChartGroupsForProductEdit } from "@/redux/slices/productSlice"
import productService, { UpdateBasicDetailsRequest } from "@/redux/services/productService"
import type { ProductDetail } from "@/redux/services/productService"

interface BasicDetailsEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductDetail
  onSuccess: () => void
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Extract basic details from product
function extractBasicDetails(product: ProductDetail) {
  const metadata = product.metadata as {
    dimensions?: { width: number; height: number; length: number }
    engraving?: { hasEngraving: boolean; maxCharacters?: number }
    sizeChart?: { hasSizeChart: boolean; sizeChartGroupId?: string }
  }

  return {
    title: product.name || "",
    slug: product.slug || "",
    productSku: product.base_sku || "",
    styleSku: product.style_sku || "",
    shortDescription: product.short_description || "",
    description: product.description || "",
    width: metadata?.dimensions?.width?.toString() || "",
    height: metadata?.dimensions?.height?.toString() || "",
    length: metadata?.dimensions?.length?.toString() || "",
    hasEngraving: metadata?.engraving?.hasEngraving || false,
    engravingMaxChars: metadata?.engraving?.maxCharacters?.toString() || "",
    hasSizeChart: metadata?.sizeChart?.hasSizeChart || false,
    sizeChartGroupId: metadata?.sizeChart?.sizeChartGroupId || "",
  }
}

interface FormErrors {
  title?: string
  slug?: string
  productSku?: string
  width?: string
  height?: string
  length?: string
  engravingMaxChars?: string
  sizeChartGroupId?: string
}

export function BasicDetailsEditDrawer({
  open,
  onOpenChange,
  product,
  onSuccess,
}: BasicDetailsEditDrawerProps) {
  const dispatch = useAppDispatch()
  const { sizeChartGroups, isLoadingSizeChartGroups } = useAppSelector(
    (state) => state.product
  )

  // Form state
  const [formData, setFormData] = useState(() => extractBasicDetails(product))
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true)

  // Fetch size chart groups when drawer opens
  useEffect(() => {
    if (open) {
      dispatch(fetchSizeChartGroupsForProductEdit())
      // Reset form data when drawer opens
      setFormData(extractBasicDetails(product))
      setErrors({})
      setSlugManuallyEdited(true)
    }
  }, [open, dispatch, product])

  // Handle field change
  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is updated
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Auto-generate slug from title if not manually edited
    if (field === "title" && !slugManuallyEdited && typeof value === "string") {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }))
    }

    // Track manual slug edits
    if (field === "slug") {
      setSlugManuallyEdited(true)
    }

    // Clear conditional fields when toggled off
    if (field === "hasEngraving" && value === false) {
      setFormData((prev) => ({ ...prev, engravingMaxChars: "" }))
      setErrors((prev) => ({ ...prev, engravingMaxChars: undefined }))
    }
    if (field === "hasSizeChart" && value === false) {
      setFormData((prev) => ({ ...prev, sizeChartGroupId: "" }))
      setErrors((prev) => ({ ...prev, sizeChartGroupId: undefined }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required"
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and dashes"
    }
    if (!formData.productSku.trim()) {
      newErrors.productSku = "Product SKU is required"
    }
    if (!formData.width) {
      newErrors.width = "Width is required"
    }
    if (!formData.height) {
      newErrors.height = "Height is required"
    }
    if (!formData.length) {
      newErrors.length = "Length is required"
    }
    if (formData.hasEngraving && !formData.engravingMaxChars) {
      newErrors.engravingMaxChars = "Maximum characters is required"
    }
    if (formData.hasSizeChart && !formData.sizeChartGroupId) {
      newErrors.sizeChartGroupId = "Size chart group is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const requestData: UpdateBasicDetailsRequest = {
        title: formData.title,
        slug: formData.slug,
        productSku: formData.productSku,
        styleSku: formData.styleSku || null,
        shortDescription: formData.shortDescription || null,
        description: formData.description || null,
        dimensions: {
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          length: parseFloat(formData.length),
        },
        engraving: {
          hasEngraving: formData.hasEngraving,
          maxChars: formData.hasEngraving && formData.engravingMaxChars
            ? parseInt(formData.engravingMaxChars)
            : null,
        },
        sizeChart: {
          hasSizeChart: formData.hasSizeChart,
          sizeChartGroupId: formData.hasSizeChart
            ? formData.sizeChartGroupId
            : null,
        },
      }

      const response = await productService.updateBasicDetails(product.id, requestData)
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
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Basic Details</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update the basic information for this product
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter product title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              maxLength={500}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="product-slug"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              maxLength={500}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          {/* Product SKU and Style SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productSku">
                Product SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productSku"
                placeholder="Enter product SKU"
                value={formData.productSku}
                onChange={(e) => handleChange("productSku", e.target.value)}
                maxLength={100}
              />
              {errors.productSku && (
                <p className="text-sm text-destructive">{errors.productSku}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="styleSku">Style SKU</Label>
              <Input
                id="styleSku"
                placeholder="Enter style SKU (optional)"
                value={formData.styleSku}
                onChange={(e) => handleChange("styleSku", e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              placeholder="Enter a brief description"
              value={formData.shortDescription}
              onChange={(e) => handleChange("shortDescription", e.target.value)}
              rows={2}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.shortDescription.length}/500 characters
            </p>
          </div>

          {/* Description (HTML) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (HTML)</Label>
            <Textarea
              id="description"
              placeholder="Enter detailed description (HTML supported)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              You can use HTML tags for formatting
            </p>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label>Dimensions (mm) <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Input
                  id="width"
                  type="number"
                  placeholder="Width"
                  value={formData.width}
                  onChange={(e) => handleChange("width", e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.width && (
                  <p className="text-xs text-destructive">{errors.width}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  id="height"
                  type="number"
                  placeholder="Height"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.height && (
                  <p className="text-xs text-destructive">{errors.height}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  id="length"
                  type="number"
                  placeholder="Length"
                  value={formData.length}
                  onChange={(e) => handleChange("length", e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.length && (
                  <p className="text-xs text-destructive">{errors.length}</p>
                )}
              </div>
            </div>
          </div>

          {/* Engraving Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasEngraving"
                checked={formData.hasEngraving}
                onCheckedChange={(checked) =>
                  handleChange("hasEngraving", checked === true)
                }
              />
              <Label htmlFor="hasEngraving" className="cursor-pointer">
                Product has engraving option
              </Label>
            </div>

            {formData.hasEngraving && (
              <div className="ml-7 space-y-2">
                <Label htmlFor="engravingMaxChars">Maximum Characters</Label>
                <Input
                  id="engravingMaxChars"
                  type="number"
                  placeholder="Enter max characters allowed"
                  value={formData.engravingMaxChars}
                  onChange={(e) =>
                    handleChange("engravingMaxChars", e.target.value)
                  }
                  min="1"
                  className="max-w-[200px]"
                />
                {errors.engravingMaxChars && (
                  <p className="text-sm text-destructive">
                    {errors.engravingMaxChars}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Size Chart Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasSizeChart"
                checked={formData.hasSizeChart}
                onCheckedChange={(checked) =>
                  handleChange("hasSizeChart", checked === true)
                }
              />
              <Label htmlFor="hasSizeChart" className="cursor-pointer">
                Product has size chart
              </Label>
            </div>

            {formData.hasSizeChart && (
              <div className="ml-7 space-y-2">
                <Label htmlFor="sizeChartGroupId">Size Chart Group</Label>
                <Select
                  value={formData.sizeChartGroupId}
                  onValueChange={(value) =>
                    handleChange("sizeChartGroupId", value)
                  }
                  disabled={isLoadingSizeChartGroups}
                >
                  <SelectTrigger className="max-w-[300px]">
                    <SelectValue
                      placeholder={
                        isLoadingSizeChartGroups
                          ? "Loading..."
                          : "Select size chart group"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeChartGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sizeChartGroupId && (
                  <p className="text-sm text-destructive">
                    {errors.sizeChartGroupId}
                  </p>
                )}
              </div>
            )}
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
