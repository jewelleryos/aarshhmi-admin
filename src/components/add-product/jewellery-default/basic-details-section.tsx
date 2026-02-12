"use client"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SizeChartGroup {
  id: string
  name: string
}

interface BasicDetailsData {
  title: string
  slug: string
  productSku: string
  styleSku: string
  shortDescription: string
  htmlDescription: string
  width: string
  height: string
  length: string
  hasEngraving: boolean
  engravingMaxChars: string
  hasSizeChart: boolean
  sizeChartGroupId: string
}

interface BasicDetailsErrors {
  title?: string
  slug?: string
  productSku?: string
  width?: string
  height?: string
  length?: string
  engravingMaxChars?: string
  sizeChartGroupId?: string
}

interface BasicDetailsSectionProps {
  data: BasicDetailsData
  errors: BasicDetailsErrors
  sizeChartGroups: SizeChartGroup[]
  isLoadingSizeChartGroups?: boolean
  onChange: (field: keyof BasicDetailsData, value: string | boolean) => void
}

export function BasicDetailsSection({
  data,
  errors,
  sizeChartGroups,
  isLoadingSizeChartGroups = false,
  onChange,
}: BasicDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter product title"
              value={data.title}
              onChange={(e) => onChange("title", e.target.value)}
              maxLength={500}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug{" "}
              <span className="text-muted-foreground font-normal">
                (auto-generated)
              </span>
            </Label>
            <Input
              id="slug"
              placeholder="product-slug"
              value={data.slug}
              onChange={(e) => onChange("slug", e.target.value)}
              maxLength={500}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug}</p>
            )}
          </div>
        </div>

        {/* Row 2: Product SKU and Style SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product SKU */}
          <div className="space-y-2">
            <Label htmlFor="productSku">
              Product SKU <span className="text-destructive">*</span>
            </Label>
            <Input
              id="productSku"
              placeholder="Enter product SKU"
              value={data.productSku}
              onChange={(e) => onChange("productSku", e.target.value)}
              maxLength={100}
            />
            {errors.productSku && (
              <p className="text-sm text-destructive">{errors.productSku}</p>
            )}
          </div>

          {/* Style SKU */}
          <div className="space-y-2">
            <Label htmlFor="styleSku">Style SKU</Label>
            <Input
              id="styleSku"
              placeholder="Enter style SKU (optional)"
              value={data.styleSku}
              onChange={(e) => onChange("styleSku", e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        {/* Row 3: Short Description */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            placeholder="Enter a brief description"
            value={data.shortDescription}
            onChange={(e) => onChange("shortDescription", e.target.value)}
            rows={2}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {data.shortDescription.length}/500 characters
          </p>
        </div>

        {/* Row 4: HTML Description */}
        <div className="space-y-2">
          <Label htmlFor="htmlDescription">Description (HTML)</Label>
          <Textarea
            id="htmlDescription"
            placeholder="Enter detailed description (HTML supported)"
            value={data.htmlDescription}
            onChange={(e) => onChange("htmlDescription", e.target.value)}
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            You can use HTML tags for formatting
          </p>
        </div>

        {/* Row 5: Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Width */}
          <div className="space-y-2">
            <Label htmlFor="width">
              Width (mm) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="width"
              type="number"
              placeholder="0"
              value={data.width}
              onChange={(e) => onChange("width", e.target.value)}
              min="0"
              step="0.01"
            />
            {errors.width && (
              <p className="text-sm text-destructive">{errors.width}</p>
            )}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">
              Height (mm) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="0"
              value={data.height}
              onChange={(e) => onChange("height", e.target.value)}
              min="0"
              step="0.01"
            />
            {errors.height && (
              <p className="text-sm text-destructive">{errors.height}</p>
            )}
          </div>

          {/* Length */}
          <div className="space-y-2">
            <Label htmlFor="length">
              Length (mm) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="length"
              type="number"
              placeholder="0"
              value={data.length}
              onChange={(e) => onChange("length", e.target.value)}
              min="0"
              step="0.01"
            />
            {errors.length && (
              <p className="text-sm text-destructive">{errors.length}</p>
            )}
          </div>
        </div>

        {/* Row 6: Engraving Option */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="hasEngraving"
              checked={data.hasEngraving}
              onCheckedChange={(checked) =>
                onChange("hasEngraving", checked === true)
              }
            />
            <Label htmlFor="hasEngraving" className="cursor-pointer">
              Product has engraving option
            </Label>
          </div>

          {data.hasEngraving && (
            <div className="ml-7 space-y-2">
              <Label htmlFor="engravingMaxChars">Maximum Characters</Label>
              <Input
                id="engravingMaxChars"
                type="number"
                placeholder="Enter max characters allowed"
                value={data.engravingMaxChars}
                onChange={(e) => onChange("engravingMaxChars", e.target.value)}
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

        {/* Row 7: Size Chart Option */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="hasSizeChart"
              checked={data.hasSizeChart}
              onCheckedChange={(checked) =>
                onChange("hasSizeChart", checked === true)
              }
            />
            <Label htmlFor="hasSizeChart" className="cursor-pointer">
              Product has size chart
            </Label>
          </div>

          {data.hasSizeChart && (
            <div className="ml-7 space-y-2">
              <Label htmlFor="sizeChartGroupId">Size Chart Group</Label>
              <Select
                value={data.sizeChartGroupId}
                onValueChange={(value) => onChange("sizeChartGroupId", value)}
                disabled={isLoadingSizeChartGroups}
              >
                <SelectTrigger className="max-w-[300px]">
                  <SelectValue placeholder={isLoadingSizeChartGroups ? "Loading..." : "Select size chart group"} />
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
      </CardContent>
    </Card>
  )
}
