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
  purities: SelectedPurity[]
}

interface MetalDetailsData {
  colorIds: string[]
  selectedMetals: SelectedMetal[]
}

// Error structure for metal details
export interface MetalDetailsErrors {
  noMetalSelected?: string
  noColorSelected?: string
  metalErrors?: {
    [metalTypeId: string]: {
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

  // Get purities for a metal type
  const getPuritiesForMetalType = (metalTypeId: string) => {
    return metalPurities.filter((p) => p.metal_type_id === metalTypeId)
  }

  // Handle metal type toggle
  const handleMetalTypeToggle = (metalTypeId: string, checked: boolean) => {
    if (checked) {
      // Add metal type
      onChange({
        ...data,
        selectedMetals: [
          ...data.selectedMetals,
          { metalTypeId, purities: [] },
        ],
      })
    } else {
      // Remove metal type
      onChange({
        ...data,
        selectedMetals: data.selectedMetals.filter(
          (m) => m.metalTypeId !== metalTypeId
        ),
      })
    }
  }

  // Handle global color toggle
  const handleColorToggle = (colorId: string, checked: boolean) => {
    onChange({
      ...data,
      colorIds: checked
        ? [...data.colorIds, colorId]
        : data.colorIds.filter((id) => id !== colorId),
    })
  }

  // Handle purity toggle
  const handlePurityToggle = (
    metalTypeId: string,
    purityId: string,
    checked: boolean
  ) => {
    onChange({
      ...data,
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
      ...data,
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

        {/* Global Color Selection */}
        {metalColors.length > 0 && (
          <div className="space-y-3">
            <Label>Select Colors</Label>
            <div className="flex flex-wrap gap-4">
              {metalColors.map((color) => (
                <div
                  key={color.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`color-${color.id}`}
                    checked={data.colorIds.includes(color.id)}
                    onCheckedChange={(checked) =>
                      handleColorToggle(color.id, checked === true)
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
            {errors.noColorSelected && (
              <p className="text-sm text-destructive">{errors.noColorSelected}</p>
            )}
          </div>
        )}

        {/* Selected Metal Cards (purities + weights only) */}
        {data.selectedMetals.map((selectedMetal) => {
          const metalType = metalTypes.find(
            (m) => m.id === selectedMetal.metalTypeId
          )
          if (!metalType) return null

          const purities = getPuritiesForMetalType(selectedMetal.metalTypeId)

          return (
            <Card key={selectedMetal.metalTypeId} className="border-muted">
              <CardHeader>
                <CardTitle className="text-base">{metalType.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {purities.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No purities configured for this metal type.
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
