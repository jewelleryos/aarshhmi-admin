"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { DropdownItem, GemstonePriceFilters } from "@/redux/services/gemstonePricingService"

interface GemstonePricingFiltersProps {
  gemstoneTypes: DropdownItem[]
  shapes: DropdownItem[]
  qualities: DropdownItem[]
  colors: DropdownItem[]
  filters: GemstonePriceFilters
  onFilterChange: (filters: GemstonePriceFilters) => void
}

export function GemstonePricingFilters({
  gemstoneTypes,
  shapes,
  qualities,
  colors,
  filters,
  onFilterChange,
}: GemstonePricingFiltersProps) {
  const hasFilters =
    filters.stone_type_id ||
    filters.stone_shape_id ||
    filters.stone_quality_id ||
    filters.stone_color_id

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      stone_type_id: value === "all" ? undefined : value,
    })
  }

  const handleShapeChange = (value: string) => {
    onFilterChange({
      ...filters,
      stone_shape_id: value === "all" ? undefined : value,
    })
  }

  const handleQualityChange = (value: string) => {
    onFilterChange({
      ...filters,
      stone_quality_id: value === "all" ? undefined : value,
    })
  }

  const handleColorChange = (value: string) => {
    onFilterChange({
      ...filters,
      stone_color_id: value === "all" ? undefined : value,
    })
  }

  const handleClearFilters = () => {
    onFilterChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={filters.stone_type_id || "all"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {gemstoneTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.stone_shape_id || "all"}
        onValueChange={handleShapeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Shape" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Shapes</SelectItem>
          {shapes.map((shape) => (
            <SelectItem key={shape.id} value={shape.id}>
              {shape.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.stone_quality_id || "all"}
        onValueChange={handleQualityChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Quality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Qualities</SelectItem>
          {qualities.map((quality) => (
            <SelectItem key={quality.id} value={quality.id}>
              {quality.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.stone_color_id || "all"}
        onValueChange={handleColorChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Colors</SelectItem>
          {colors.map((color) => (
            <SelectItem key={color.id} value={color.id}>
              {color.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
