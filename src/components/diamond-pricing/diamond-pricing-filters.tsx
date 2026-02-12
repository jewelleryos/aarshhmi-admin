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
import { DropdownItem, DiamondPriceFilters } from "@/redux/services/diamondPricingService"

interface DiamondPricingFiltersProps {
  shapes: DropdownItem[]
  qualities: DropdownItem[]
  filters: DiamondPriceFilters
  onFilterChange: (filters: DiamondPriceFilters) => void
}

export function DiamondPricingFilters({
  shapes,
  qualities,
  filters,
  onFilterChange,
}: DiamondPricingFiltersProps) {
  const hasFilters = filters.stone_shape_id || filters.stone_quality_id

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

  const handleClearFilters = () => {
    onFilterChange({})
  }

  return (
    <div className="flex items-center gap-4">
      <Select
        value={filters.stone_shape_id || "all"}
        onValueChange={handleShapeChange}
      >
        <SelectTrigger className="w-[200px]">
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
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by Clarity/Color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clarity/Colors</SelectItem>
          {qualities.map((quality) => (
            <SelectItem key={quality.id} value={quality.id}>
              {quality.name}
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
