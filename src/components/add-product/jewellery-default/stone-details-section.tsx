"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

// Types (matching backend API response)
interface DiamondClarityColor {
  id: string
  name: string
  slug: string
}

interface DiamondPricing {
  id: string
  stone_shape_id: string
  stone_quality_id: string  // This is clarity/color id
  ct_from: number
  ct_to: number
  price: number  // Price in smallest unit (paise)
}

interface StoneShape {
  id: string
  name: string
  slug: string
}

interface GemstoneType {
  id: string
  name: string
  slug: string
}

interface GemstoneQuality {
  id: string
  name: string
  slug: string
}

interface GemstoneColor {
  id: string
  name: string
  slug: string
}

interface GemstonePricing {
  id: string
  stone_type_id: string
  stone_shape_id: string
  stone_quality_id: string
  stone_color_id: string
  ct_from: number
  ct_to: number
  price: number  // Price in smallest unit (paise)
}

interface DiamondEntry {
  id: string
  shapeId: string
  totalCarat: string
  noOfStones: string
  pricings: Record<string, string> // clarityColorId -> pricingId
}

interface GemstoneEntry {
  id: string
  typeId: string
  shapeId: string
  totalCarat: string
  noOfStones: string
  pricings: Record<string, string>  // colorId -> pricingId
}

interface PearlType {
  id: string
  name: string
  slug: string
}

interface PearlQuality {
  id: string
  name: string
  slug: string
}

interface PearlEntry {
  id: string
  typeId: string
  qualityId: string
  noOfPearls: string
  totalGrams: string
  amount: string
}

interface StoneDetailsData {
  hasDiamond: boolean
  hasGemstone: boolean
  hasPearl: boolean
  diamondClarityColorIds: string[]
  diamonds: DiamondEntry[]
  gemstoneQualityId: string            // Single selection (NEW)
  gemstoneColorIds: string[]           // Multiple selection (NEW)
  gemstones: GemstoneEntry[]
  pearls: PearlEntry[]
}

// Error structure for stone details
export interface StoneDetailsErrors {
  // Diamond errors
  noClarityColorSelected?: string
  noDiamondAdded?: string
  diamondErrors?: {
    [diamondId: string]: {
      shapeId?: string
      totalCarat?: string
      noOfStones?: string
      pricingErrors?: {
        [clarityColorId: string]: string
      }
    }
  }

  // Gemstone errors
  noQualitySelected?: string
  noColorSelected?: string
  noGemstoneAdded?: string
  gemstoneErrors?: {
    [gemstoneId: string]: {
      typeId?: string
      shapeId?: string
      totalCarat?: string
      noOfStones?: string
      pricingErrors?: {
        [colorId: string]: string
      }
    }
  }

  // Pearl errors
  noPearlAdded?: string
  pearlErrors?: {
    [pearlId: string]: {
      typeId?: string
      qualityId?: string
      noOfPearls?: string
      totalGrams?: string
      amount?: string
    }
  }
}

interface StoneDetailsSectionProps {
  data: StoneDetailsData
  diamondClarityColors: DiamondClarityColor[]
  diamondPricings: DiamondPricing[]
  stoneShapes: StoneShape[]
  gemstoneTypes: GemstoneType[]
  gemstoneQualities: GemstoneQuality[]
  gemstoneColors: GemstoneColor[]
  gemstonePricings: GemstonePricing[]
  pearlTypes: PearlType[]
  pearlQualities: PearlQuality[]
  errors?: StoneDetailsErrors
  onChange: (data: StoneDetailsData) => void
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9)

export function StoneDetailsSection({
  data,
  diamondClarityColors,
  diamondPricings,
  stoneShapes,
  gemstoneTypes,
  gemstoneQualities,
  gemstoneColors,
  gemstonePricings,
  pearlTypes,
  pearlQualities,
  errors = {},
  onChange,
}: StoneDetailsSectionProps) {
  // Handle checkbox changes
  const handleCheckboxChange = (
    field: "hasDiamond" | "hasGemstone" | "hasPearl",
    checked: boolean
  ) => {
    const updates: Partial<StoneDetailsData> = { [field]: checked }

    // Reset related data when unchecked
    if (field === "hasDiamond" && !checked) {
      updates.diamondClarityColorIds = []
      updates.diamonds = []
    }
    if (field === "hasGemstone" && !checked) {
      updates.gemstoneQualityId = ""
      updates.gemstoneColorIds = []
      updates.gemstones = []
    }
    if (field === "hasPearl" && !checked) {
      updates.pearls = []
    }

    onChange({ ...data, ...updates })
  }

  // Handle diamond clarity/color toggle
  const handleDiamondClarityColorToggle = (clarityColorId: string, checked: boolean) => {
    const newIds = checked
      ? [...data.diamondClarityColorIds, clarityColorId]
      : data.diamondClarityColorIds.filter((id) => id !== clarityColorId)

    // Also update existing diamonds to remove pricings for unchecked clarity/colors
    const updatedDiamonds = data.diamonds.map((d) => {
      if (!checked) {
        const { [clarityColorId]: removed, ...rest } = d.pricings
        return { ...d, pricings: rest }
      }
      return d
    })

    onChange({ ...data, diamondClarityColorIds: newIds, diamonds: updatedDiamonds })
  }

  // Add diamond entry
  const handleAddDiamond = () => {
    const newDiamond: DiamondEntry = {
      id: generateId(),
      shapeId: "",
      totalCarat: "",
      noOfStones: "",
      pricings: {},
    }
    onChange({ ...data, diamonds: [...data.diamonds, newDiamond] })
  }

  // Update diamond entry
  const handleDiamondChange = (
    diamondId: string,
    field: "shapeId" | "totalCarat" | "noOfStones",
    value: string
  ) => {
    onChange({
      ...data,
      diamonds: data.diamonds.map((d) =>
        d.id === diamondId ? { ...d, [field]: value } : d
      ),
    })
  }

  // Update diamond pricing for specific clarity/color
  const handleDiamondPricingChange = (
    diamondId: string,
    clarityColorId: string,
    pricingId: string
  ) => {
    onChange({
      ...data,
      diamonds: data.diamonds.map((d) =>
        d.id === diamondId
          ? { ...d, pricings: { ...d.pricings, [clarityColorId]: pricingId } }
          : d
      ),
    })
  }

  // Remove diamond entry
  const handleRemoveDiamond = (diamondId: string) => {
    onChange({
      ...data,
      diamonds: data.diamonds.filter((d) => d.id !== diamondId),
    })
  }

  // Handle gemstone quality change (single selection)
  const handleGemstoneQualityChange = (qualityId: string) => {
    onChange({ ...data, gemstoneQualityId: qualityId })
  }

  // Handle gemstone color toggle (multiple selection)
  const handleGemstoneColorToggle = (colorId: string, checked: boolean) => {
    const newIds = checked
      ? [...data.gemstoneColorIds, colorId]
      : data.gemstoneColorIds.filter((id) => id !== colorId)

    // Also update existing gemstones to remove pricings for unchecked colors
    const updatedGemstones = data.gemstones.map((g) => {
      if (!checked) {
        const { [colorId]: removed, ...rest } = g.pricings
        return { ...g, pricings: rest }
      }
      return g
    })

    onChange({ ...data, gemstoneColorIds: newIds, gemstones: updatedGemstones })
  }

  // Add gemstone entry
  const handleAddGemstone = () => {
    const newGemstone: GemstoneEntry = {
      id: generateId(),
      typeId: "",
      shapeId: "",
      totalCarat: "",
      noOfStones: "",
      pricings: {},
    }
    onChange({ ...data, gemstones: [...data.gemstones, newGemstone] })
  }

  // Update gemstone entry
  const handleGemstoneChange = (
    gemstoneId: string,
    field: "typeId" | "shapeId" | "totalCarat" | "noOfStones",
    value: string
  ) => {
    onChange({
      ...data,
      gemstones: data.gemstones.map((g) =>
        g.id === gemstoneId ? { ...g, [field]: value } : g
      ),
    })
  }

  // Update gemstone pricing for specific color
  const handleGemstonePricingChange = (
    gemstoneId: string,
    colorId: string,
    pricingId: string
  ) => {
    onChange({
      ...data,
      gemstones: data.gemstones.map((g) =>
        g.id === gemstoneId
          ? { ...g, pricings: { ...g.pricings, [colorId]: pricingId } }
          : g
      ),
    })
  }

  // Remove gemstone entry
  const handleRemoveGemstone = (gemstoneId: string) => {
    onChange({
      ...data,
      gemstones: data.gemstones.filter((g) => g.id !== gemstoneId),
    })
  }

  // Filter diamond pricings based on clarity/color and shape
  const getFilteredDiamondPricings = (clarityColorId: string, shapeId: string) => {
    return diamondPricings.filter(
      (p) =>
        p.stone_quality_id === clarityColorId && p.stone_shape_id === shapeId
    )
  }

  // Format diamond pricing display name (e.g., "0.01-0.05 ct")
  const formatDiamondPricingName = (pricing: DiamondPricing) => {
    return `${pricing.ct_from}-${pricing.ct_to} ct`
  }

  // Filter gemstone pricings based on selections (using top-level quality and specific color)
  const getFilteredGemstonePricings = (gemstone: GemstoneEntry, colorId: string) => {
    return gemstonePricings.filter(
      (p) =>
        p.stone_type_id === gemstone.typeId &&
        p.stone_shape_id === gemstone.shapeId &&
        p.stone_quality_id === data.gemstoneQualityId &&
        p.stone_color_id === colorId
    )
  }

  // Format gemstone pricing display name (e.g., "0.5-1.0 ct")
  const formatGemstonePricingName = (pricing: GemstonePricing) => {
    return `${pricing.ct_from}-${pricing.ct_to} ct`
  }

  // Add pearl entry
  const handleAddPearl = () => {
    const newPearl: PearlEntry = {
      id: generateId(),
      typeId: "",
      qualityId: "",
      noOfPearls: "",
      totalGrams: "",
      amount: "",
    }
    onChange({ ...data, pearls: [...data.pearls, newPearl] })
  }

  // Update pearl entry
  const handlePearlChange = (
    pearlId: string,
    field: keyof PearlEntry,
    value: string
  ) => {
    onChange({
      ...data,
      pearls: data.pearls.map((p) =>
        p.id === pearlId ? { ...p, [field]: value } : p
      ),
    })
  }

  // Remove pearl entry
  const handleRemovePearl = (pearlId: string) => {
    onChange({
      ...data,
      pearls: data.pearls.filter((p) => p.id !== pearlId),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stone Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stone Type Selection */}
        <div className="space-y-3">
          <Label>Select Stone Types</Label>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-diamond"
                checked={data.hasDiamond}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("hasDiamond", checked === true)
                }
              />
              <Label htmlFor="has-diamond" className="cursor-pointer font-normal">
                Has Diamond
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-gemstone"
                checked={data.hasGemstone}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("hasGemstone", checked === true)
                }
              />
              <Label htmlFor="has-gemstone" className="cursor-pointer font-normal">
                Has Gemstone
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-pearl"
                checked={data.hasPearl}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("hasPearl", checked === true)
                }
              />
              <Label htmlFor="has-pearl" className="cursor-pointer font-normal">
                Has Pearl
              </Label>
            </div>
          </div>
        </div>

        {/* Diamond Section */}
        {data.hasDiamond && (
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-base">Diamond</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Diamond Clarity/Color Selection (Multiple) */}
              <div className="space-y-3">
                <Label>Select Diamond Clarity/Color</Label>
                <div className="flex flex-wrap gap-4">
                  {diamondClarityColors.map((cc) => (
                    <div key={cc.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`clarity-color-${cc.id}`}
                        checked={data.diamondClarityColorIds.includes(cc.id)}
                        onCheckedChange={(checked) =>
                          handleDiamondClarityColorToggle(cc.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`clarity-color-${cc.id}`}
                        className="cursor-pointer font-normal"
                      >
                        {cc.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.noClarityColorSelected && (
                  <p className="text-sm text-destructive">{errors.noClarityColorSelected}</p>
                )}
              </div>

              {/* Diamond Entries */}
              {data.diamondClarityColorIds.length > 0 && (
                <>
                  {data.diamonds.map((diamond) => (
                    <div
                      key={diamond.id}
                      className="p-4 bg-muted/30 rounded-md space-y-4"
                    >
                      {/* First Row: Shape, Total Carat, No. of Stones, Remove */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Shape */}
                        <div className="space-y-1">
                          <Label className="text-sm">Shape</Label>
                          <Select
                            value={diamond.shapeId}
                            onValueChange={(value) =>
                              handleDiamondChange(diamond.id, "shapeId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {stoneShapes.map((shape) => (
                                <SelectItem key={shape.id} value={shape.id}>
                                  {shape.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.diamondErrors?.[diamond.id]?.shapeId && (
                            <p className="text-sm text-destructive">
                              {errors.diamondErrors[diamond.id].shapeId}
                            </p>
                          )}
                        </div>

                        {/* Total Carat */}
                        <div className="space-y-1">
                          <Label className="text-sm">Total Carat</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={diamond.totalCarat}
                            onChange={(e) =>
                              handleDiamondChange(
                                diamond.id,
                                "totalCarat",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                          {errors.diamondErrors?.[diamond.id]?.totalCarat && (
                            <p className="text-sm text-destructive">
                              {errors.diamondErrors[diamond.id].totalCarat}
                            </p>
                          )}
                        </div>

                        {/* No of Stones */}
                        <div className="space-y-1">
                          <Label className="text-sm">No. of Stones</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={diamond.noOfStones}
                            onChange={(e) =>
                              handleDiamondChange(
                                diamond.id,
                                "noOfStones",
                                e.target.value
                              )
                            }
                            min="0"
                            step="1"
                          />
                          {errors.diamondErrors?.[diamond.id]?.noOfStones && (
                            <p className="text-sm text-destructive">
                              {errors.diamondErrors[diamond.id].noOfStones}
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDiamond(diamond.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Second Row: Pricing dropdowns for each selected clarity/color */}
                      {diamond.shapeId && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {data.diamondClarityColorIds.map((ccId) => {
                            const cc = diamondClarityColors.find((c) => c.id === ccId)
                            if (!cc) return null
                            const pricingOptions = getFilteredDiamondPricings(ccId, diamond.shapeId)
                            const pricingError = errors.diamondErrors?.[diamond.id]?.pricingErrors?.[ccId]
                            return (
                              <div key={ccId} className="space-y-1">
                                <Label className="text-sm">
                                  Pricing ({cc.name})
                                </Label>
                                <Select
                                  value={diamond.pricings[ccId] || ""}
                                  onValueChange={(value) =>
                                    handleDiamondPricingChange(diamond.id, ccId, value)
                                  }
                                  disabled={pricingOptions.length === 0}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={pricingOptions.length === 0 ? "No pricing available" : "Select"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pricingOptions.map(
                                      (pricing) => (
                                        <SelectItem key={pricing.id} value={pricing.id}>
                                          {formatDiamondPricingName(pricing)}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                {pricingError && (
                                  <p className="text-sm text-destructive">{pricingError}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Diamond Button */}
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddDiamond}
                      className="w-full md:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Diamond
                    </Button>
                    {errors.noDiamondAdded && (
                      <p className="text-sm text-destructive">{errors.noDiamondAdded}</p>
                    )}
                  </div>
                </>
              )}

              {data.diamondClarityColorIds.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Please select at least one clarity/color to add diamonds.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gemstone Section */}
        {data.hasGemstone && (
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-base">Gemstone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gemstone Quality Selection (Single) */}
              <div className="space-y-3">
                <Label>Select Quality</Label>
                <div className="flex flex-wrap gap-4">
                  {gemstoneQualities.map((quality) => (
                    <div key={quality.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gemstone-quality-${quality.id}`}
                        checked={data.gemstoneQualityId === quality.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleGemstoneQualityChange(quality.id)
                          }
                        }}
                      />
                      <Label
                        htmlFor={`gemstone-quality-${quality.id}`}
                        className="cursor-pointer font-normal"
                      >
                        {quality.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.noQualitySelected && (
                  <p className="text-sm text-destructive">{errors.noQualitySelected}</p>
                )}
              </div>

              {/* Gemstone Colors Selection (Multiple) */}
              <div className="space-y-3">
                <Label>Select Colors</Label>
                <div className="flex flex-wrap gap-4">
                  {gemstoneColors.map((color) => (
                    <div key={color.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gemstone-color-${color.id}`}
                        checked={data.gemstoneColorIds.includes(color.id)}
                        onCheckedChange={(checked) =>
                          handleGemstoneColorToggle(color.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`gemstone-color-${color.id}`}
                        className="cursor-pointer font-normal"
                      >
                        {color.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.noColorSelected && (
                  <p className="text-sm text-destructive">{errors.noColorSelected}</p>
                )}
              </div>

              {/* Gemstone Entries - Only show when quality and colors are selected */}
              {data.gemstoneQualityId && data.gemstoneColorIds.length > 0 && (
                <>
                  {data.gemstones.map((gemstone) => {
                    const gemstoneError = errors.gemstoneErrors?.[gemstone.id]
                    return (
                      <div
                        key={gemstone.id}
                        className="p-4 bg-muted/30 rounded-md space-y-4"
                      >
                        {/* First Row: Type, Shape, Total Carat, No. of Stones, Remove */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Type */}
                          <div className="space-y-1">
                            <Label className="text-sm">Gemstone Type</Label>
                            <Select
                              value={gemstone.typeId}
                              onValueChange={(value) =>
                                handleGemstoneChange(gemstone.id, "typeId", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {gemstoneTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {gemstoneError?.typeId && (
                              <p className="text-sm text-destructive">{gemstoneError.typeId}</p>
                            )}
                          </div>

                          {/* Shape */}
                          <div className="space-y-1">
                            <Label className="text-sm">Shape</Label>
                            <Select
                              value={gemstone.shapeId}
                              onValueChange={(value) =>
                                handleGemstoneChange(gemstone.id, "shapeId", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {stoneShapes.map((shape) => (
                                  <SelectItem key={shape.id} value={shape.id}>
                                    {shape.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {gemstoneError?.shapeId && (
                              <p className="text-sm text-destructive">{gemstoneError.shapeId}</p>
                            )}
                          </div>

                          {/* Total Carat */}
                          <div className="space-y-1">
                            <Label className="text-sm">Total Carat</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={gemstone.totalCarat}
                              onChange={(e) =>
                                handleGemstoneChange(
                                  gemstone.id,
                                  "totalCarat",
                                  e.target.value
                                )
                              }
                              min="0"
                              step="0.01"
                            />
                            {gemstoneError?.totalCarat && (
                              <p className="text-sm text-destructive">{gemstoneError.totalCarat}</p>
                            )}
                          </div>

                          {/* No of Stones */}
                          <div className="space-y-1">
                            <Label className="text-sm">No. of Stones</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={gemstone.noOfStones}
                              onChange={(e) =>
                                handleGemstoneChange(
                                  gemstone.id,
                                  "noOfStones",
                                  e.target.value
                                )
                              }
                              min="0"
                              step="1"
                            />
                            {gemstoneError?.noOfStones && (
                              <p className="text-sm text-destructive">{gemstoneError.noOfStones}</p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveGemstone(gemstone.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Second Row: Pricing dropdowns for each selected color */}
                        {gemstone.typeId && gemstone.shapeId && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {data.gemstoneColorIds.map((colorId) => {
                              const color = gemstoneColors.find((c) => c.id === colorId)
                              if (!color) return null
                              const pricingOptions = getFilteredGemstonePricings(gemstone, colorId)
                              const pricingError = gemstoneError?.pricingErrors?.[colorId]
                              return (
                                <div key={colorId} className="space-y-1">
                                  <Label className="text-sm">
                                    Pricing ({color.name})
                                  </Label>
                                  <Select
                                    value={gemstone.pricings[colorId] || ""}
                                    onValueChange={(value) =>
                                      handleGemstonePricingChange(gemstone.id, colorId, value)
                                    }
                                    disabled={pricingOptions.length === 0}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={pricingOptions.length === 0 ? "No pricing available" : "Select"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {pricingOptions.map((pricing) => (
                                        <SelectItem key={pricing.id} value={pricing.id}>
                                          {formatGemstonePricingName(pricing)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {pricingError && (
                                    <p className="text-sm text-destructive">{pricingError}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Add Gemstone Button */}
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddGemstone}
                      className="w-full md:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Gemstone
                    </Button>
                    {errors.noGemstoneAdded && (
                      <p className="text-sm text-destructive">{errors.noGemstoneAdded}</p>
                    )}
                  </div>
                </>
              )}

              {(!data.gemstoneQualityId || data.gemstoneColorIds.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  Please select a quality and at least one color to add gemstones.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pearl Section */}
        {data.hasPearl && (
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-base">Pearl</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pearl Entries */}
              {data.pearls.map((pearl) => {
                const pearlError = errors.pearlErrors?.[pearl.id]
                return (
                  <div
                    key={pearl.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-md"
                  >
                    {/* Pearl Type */}
                    <div className="space-y-1">
                      <Label className="text-sm">Pearl Type</Label>
                      <Select
                        value={pearl.typeId}
                        onValueChange={(value) =>
                          handlePearlChange(pearl.id, "typeId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {pearlTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pearlError?.typeId && (
                        <p className="text-sm text-destructive">{pearlError.typeId}</p>
                      )}
                    </div>

                    {/* Pearl Quality */}
                    <div className="space-y-1">
                      <Label className="text-sm">Pearl Quality</Label>
                      <Select
                        value={pearl.qualityId}
                        onValueChange={(value) =>
                          handlePearlChange(pearl.id, "qualityId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {pearlQualities.map((quality) => (
                            <SelectItem key={quality.id} value={quality.id}>
                              {quality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pearlError?.qualityId && (
                        <p className="text-sm text-destructive">{pearlError.qualityId}</p>
                      )}
                    </div>

                    {/* No of Pearls */}
                    <div className="space-y-1">
                      <Label className="text-sm">No. of Pearls</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={pearl.noOfPearls}
                        onChange={(e) =>
                          handlePearlChange(pearl.id, "noOfPearls", e.target.value)
                        }
                        min="0"
                        step="1"
                      />
                      {pearlError?.noOfPearls && (
                        <p className="text-sm text-destructive">{pearlError.noOfPearls}</p>
                      )}
                    </div>

                    {/* Total Grams */}
                    <div className="space-y-1">
                      <Label className="text-sm">Total Grams</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={pearl.totalGrams}
                        onChange={(e) =>
                          handlePearlChange(pearl.id, "totalGrams", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                      {pearlError?.totalGrams && (
                        <p className="text-sm text-destructive">{pearlError.totalGrams}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                      <Label className="text-sm">Amount</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={pearl.amount}
                        onChange={(e) =>
                          handlePearlChange(pearl.id, "amount", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                      {pearlError?.amount && (
                        <p className="text-sm text-destructive">{pearlError.amount}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePearl(pearl.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {/* Add Pearl Button */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPearl}
                  className="w-full md:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pearl
                </Button>
                {errors.noPearlAdded && (
                  <p className="text-sm text-destructive">{errors.noPearlAdded}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No selection message */}
        {!data.hasDiamond && !data.hasGemstone && !data.hasPearl && (
          <p className="text-sm text-muted-foreground">
            Select at least one stone type to configure stone details.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
