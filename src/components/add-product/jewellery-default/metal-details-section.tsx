"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Types
interface MetalType {
  id: string
  name: string
  slug: string
}

interface MetalColor {
  id: string
  metal_type_id: string
  name: string
  slug: string
}

interface MetalPurity {
  id: string
  metal_type_id: string
  name: string
  slug: string
  price: number
}

interface SelectedPurity {
  purityId: string
  weight: string
}

interface SelectedMetal {
  metalTypeId: string
  colorIds: string[]
  purities: SelectedPurity[]
}

interface MetalDetailsData {
  selectedMetals: SelectedMetal[]
}

// Error structure for metal details
export interface MetalDetailsErrors {
  noMetalSelected?: string
  metalErrors?: {
    [metalTypeId: string]: {
      noColorSelected?: string
      noPuritySelected?: string
      weightErrors?: {
        [purityId: string]: string
      }
    }
  }
}

interface MetalDetailsSectionProps {
  data: MetalDetailsData
  metalTypes: MetalType[]
  metalColors: MetalColor[]
  metalPurities: MetalPurity[]
  errors?: MetalDetailsErrors
  isLoadingMetalTypes?: boolean
  isLoadingMetalColors?: boolean
  isLoadingMetalPurities?: boolean
  onChange: (data: MetalDetailsData) => void
}

export function MetalDetailsSection({
  data,
  metalTypes,
  metalColors,
  metalPurities,
  errors = {},
  isLoadingMetalTypes = false,
  isLoadingMetalColors = false,
  isLoadingMetalPurities = false,
  onChange,
}: MetalDetailsSectionProps) {
  // Check if a metal type is selected
  const isMetalTypeSelected = (metalTypeId: string) => {
    return data.selectedMetals.some((m) => m.metalTypeId === metalTypeId)
  }

  // Get selected metal data
  const getSelectedMetal = (metalTypeId: string) => {
    return data.selectedMetals.find((m) => m.metalTypeId === metalTypeId)
  }

  // Get colors for a metal type
  const getColorsForMetalType = (metalTypeId: string) => {
    return metalColors.filter((c) => c.metal_type_id === metalTypeId)
  }

  // Get purities for a metal type
  const getPuritiesForMetalType = (metalTypeId: string) => {
    return metalPurities.filter((p) => p.metal_type_id === metalTypeId)
  }

  // Handle metal type toggle
  const handleMetalTypeToggle = (metalTypeId: string, checked: boolean) => {
    if (checked) {
      // Add metal type
      onChange({
        selectedMetals: [
          ...data.selectedMetals,
          { metalTypeId, colorIds: [], purities: [] },
        ],
      })
    } else {
      // Remove metal type
      onChange({
        selectedMetals: data.selectedMetals.filter(
          (m) => m.metalTypeId !== metalTypeId
        ),
      })
    }
  }

  // Handle color toggle
  const handleColorToggle = (
    metalTypeId: string,
    colorId: string,
    checked: boolean
  ) => {
    onChange({
      selectedMetals: data.selectedMetals.map((m) => {
        if (m.metalTypeId !== metalTypeId) return m
        return {
          ...m,
          colorIds: checked
            ? [...m.colorIds, colorId]
            : m.colorIds.filter((id) => id !== colorId),
        }
      }),
    })
  }

  // Handle purity toggle
  const handlePurityToggle = (
    metalTypeId: string,
    purityId: string,
    checked: boolean
  ) => {
    onChange({
      selectedMetals: data.selectedMetals.map((m) => {
        if (m.metalTypeId !== metalTypeId) return m
        return {
          ...m,
          purities: checked
            ? [...m.purities, { purityId, weight: "" }]
            : m.purities.filter((p) => p.purityId !== purityId),
        }
      }),
    })
  }

  // Handle weight change
  const handleWeightChange = (
    metalTypeId: string,
    purityId: string,
    weight: string
  ) => {
    onChange({
      selectedMetals: data.selectedMetals.map((m) => {
        if (m.metalTypeId !== metalTypeId) return m
        return {
          ...m,
          purities: m.purities.map((p) =>
            p.purityId === purityId ? { ...p, weight } : p
          ),
        }
      }),
    })
  }

  // Check if color is selected
  const isColorSelected = (metalTypeId: string, colorId: string) => {
    const metal = getSelectedMetal(metalTypeId)
    return metal?.colorIds.includes(colorId) || false
  }

  // Check if purity is selected
  const isPuritySelected = (metalTypeId: string, purityId: string) => {
    const metal = getSelectedMetal(metalTypeId)
    return metal?.purities.some((p) => p.purityId === purityId) || false
  }

  // Get weight for purity
  const getPurityWeight = (metalTypeId: string, purityId: string) => {
    const metal = getSelectedMetal(metalTypeId)
    return metal?.purities.find((p) => p.purityId === purityId)?.weight || ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metal Type Selection */}
        <div className="space-y-3">
          <Label>Select Metal Types</Label>
          <div className="flex flex-wrap gap-4">
            {metalTypes.map((metalType) => (
              <div key={metalType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`metal-type-${metalType.id}`}
                  checked={isMetalTypeSelected(metalType.id)}
                  onCheckedChange={(checked) =>
                    handleMetalTypeToggle(metalType.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`metal-type-${metalType.id}`}
                  className="cursor-pointer font-normal"
                >
                  {metalType.name}
                </Label>
              </div>
            ))}
          </div>
          {errors.noMetalSelected && (
            <p className="text-sm text-destructive">{errors.noMetalSelected}</p>
          )}
        </div>

        {/* Selected Metal Cards */}
        {data.selectedMetals.map((selectedMetal) => {
          const metalType = metalTypes.find(
            (m) => m.id === selectedMetal.metalTypeId
          )
          if (!metalType) return null

          const colors = getColorsForMetalType(selectedMetal.metalTypeId)
          const purities = getPuritiesForMetalType(selectedMetal.metalTypeId)

          return (
            <Card key={selectedMetal.metalTypeId} className="border-muted">
              <CardHeader>
                <CardTitle className="text-base">{metalType.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors */}
                {colors.length > 0 && (
                  <div className="space-y-3">
                    <Label>Colors</Label>
                    <div className="flex flex-wrap gap-4">
                      {colors.map((color) => (
                        <div
                          key={color.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`color-${color.id}`}
                            checked={isColorSelected(
                              selectedMetal.metalTypeId,
                              color.id
                            )}
                            onCheckedChange={(checked) =>
                              handleColorToggle(
                                selectedMetal.metalTypeId,
                                color.id,
                                checked === true
                              )
                            }
                          />
                          <Label
                            htmlFor={`color-${color.id}`}
                            className="cursor-pointer font-normal"
                          >
                            {color.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.metalErrors?.[selectedMetal.metalTypeId]?.noColorSelected && (
                      <p className="text-sm text-destructive">
                        {errors.metalErrors[selectedMetal.metalTypeId].noColorSelected}
                      </p>
                    )}
                  </div>
                )}

                {/* Purities */}
                {purities.length > 0 && (
                  <div className="space-y-3">
                    <Label>Purities</Label>
                    <div className="flex flex-wrap gap-4">
                      {purities.map((purity) => (
                        <div
                          key={purity.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`purity-${purity.id}`}
                            checked={isPuritySelected(
                              selectedMetal.metalTypeId,
                              purity.id
                            )}
                            onCheckedChange={(checked) =>
                              handlePurityToggle(
                                selectedMetal.metalTypeId,
                                purity.id,
                                checked === true
                              )
                            }
                          />
                          <Label
                            htmlFor={`purity-${purity.id}`}
                            className="cursor-pointer font-normal"
                          >
                            {purity.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.metalErrors?.[selectedMetal.metalTypeId]?.noPuritySelected && (
                      <p className="text-sm text-destructive">
                        {errors.metalErrors[selectedMetal.metalTypeId].noPuritySelected}
                      </p>
                    )}
                  </div>
                )}

                {/* Weight Configuration */}
                {selectedMetal.purities.length > 0 && (
                  <div className="space-y-3">
                    <Label>Weight Configuration</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedMetal.purities.map((purity) => {
                        const purityData = purities.find(
                          (p) => p.id === purity.purityId
                        )
                        const weightError = errors.metalErrors?.[selectedMetal.metalTypeId]?.weightErrors?.[purity.purityId]
                        return (
                          <div key={purity.purityId} className="space-y-1">
                            <Label className="text-sm font-normal">
                              {purityData?.name}
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={purity.weight}
                                onChange={(e) =>
                                  handleWeightChange(
                                    selectedMetal.metalTypeId,
                                    purity.purityId,
                                    e.target.value
                                  )
                                }
                                min="0"
                                step="0.01"
                              />
                              <span className="text-sm text-muted-foreground">
                                g
                              </span>
                            </div>
                            {weightError && (
                              <p className="text-sm text-destructive">{weightError}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {colors.length === 0 && purities.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No colors or purities configured for this metal type.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}

        {data.selectedMetals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Select at least one metal type to configure metal details.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
