"use client"

import { useMemo, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VariantsTable, type Variant } from "./variants-table"

// Types for metal data
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

interface DiamondClarityColor {
  id: string
  name: string
  slug: string
}

// Metal details data structure
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

// Gemstone color type
interface GemstoneColor {
  id: string
  name: string
  slug: string
}

// Stone details data structure
interface StoneDetailsData {
  hasDiamond: boolean
  diamondClarityColorIds: string[]
  hasGemstone: boolean
  gemstoneColorIds: string[]
}

interface VariantsSectionProps {
  metalDetails: MetalDetailsData
  stoneDetails: StoneDetailsData
  metalTypes: MetalType[]
  metalColors: MetalColor[]
  metalPurities: MetalPurity[]
  diamondClarityColors: DiamondClarityColor[]
  gemstoneColors: GemstoneColor[]
  defaultVariantId: string | null
  onDefaultVariantChange: (variantId: string) => void
}

// Generate unique variant ID
const generateVariantId = (
  metalTypeId: string,
  colorId: string,
  purityId: string,
  diamondClarityColorId?: string,
  gemstoneColorId?: string
) => {
  const parts = [metalTypeId, colorId, purityId]
  if (diamondClarityColorId) parts.push(diamondClarityColorId)
  if (gemstoneColorId) parts.push(gemstoneColorId)
  return parts.join("-")
}

// Check if metal details are complete
const isMetalDetailsComplete = (metalDetails: MetalDetailsData): boolean => {
  return (
    metalDetails.colorIds.length > 0 &&
    metalDetails.selectedMetals.some(
      (m) =>
        m.purities.length > 0 &&
        m.purities.every((p) => p.weight && parseFloat(p.weight) > 0)
    )
  )
}

// Check if diamond details are complete (when diamonds are selected)
const isDiamondDetailsComplete = (stoneDetails: StoneDetailsData): boolean => {
  if (!stoneDetails.hasDiamond) return true
  return stoneDetails.diamondClarityColorIds.length > 0
}

// Check if gemstone details are complete (when gemstones are selected)
const isGemstoneDetailsComplete = (stoneDetails: StoneDetailsData): boolean => {
  if (!stoneDetails.hasGemstone) return true
  return stoneDetails.gemstoneColorIds.length > 0
}

export function VariantsSection({
  metalDetails,
  stoneDetails,
  metalTypes,
  metalColors,
  metalPurities,
  diamondClarityColors,
  gemstoneColors,
  defaultVariantId,
  onDefaultVariantChange,
}: VariantsSectionProps) {
  // Check completion status
  const metalComplete = isMetalDetailsComplete(metalDetails)
  const diamondComplete = isDiamondDetailsComplete(stoneDetails)
  const gemstoneComplete = isGemstoneDetailsComplete(stoneDetails)
  const canShowVariants = metalComplete && diamondComplete && gemstoneComplete

  // Generate variants
  const variants = useMemo(() => {
    if (!canShowVariants) return []

    const result: Variant[] = []

    // Get diamond clarity/colors to iterate (or [null] if no diamonds)
    const diamondOptions = stoneDetails.hasDiamond && stoneDetails.diamondClarityColorIds.length > 0
      ? stoneDetails.diamondClarityColorIds
      : [null]

    // Get gemstone colors to iterate (or [null] if no gemstones)
    const gemstoneColorOptions = stoneDetails.hasGemstone && stoneDetails.gemstoneColorIds.length > 0
      ? stoneDetails.gemstoneColorIds
      : [null]

    // Colors are global — iterate at outer level
    for (const colorId of metalDetails.colorIds) {
      const color = metalColors.find((c) => c.id === colorId)
      if (!color) continue

      for (const selectedMetal of metalDetails.selectedMetals) {
        const metalType = metalTypes.find((m) => m.id === selectedMetal.metalTypeId)
        if (!metalType) continue

        for (const purity of selectedMetal.purities) {
          // Skip purities without valid weight
          if (!purity.weight || parseFloat(purity.weight) <= 0) continue

          const purityData = metalPurities.find((p) => p.id === purity.purityId)
          if (!purityData) continue

          // Iterate over diamond options
          for (const diamondClarityColorId of diamondOptions) {
            const diamondQuality = diamondClarityColorId
              ? diamondClarityColors.find((d) => d.id === diamondClarityColorId)
              : null

            // Iterate over gemstone color options
            for (const gemstoneColorId of gemstoneColorOptions) {
              const gemstoneColor = gemstoneColorId
                ? gemstoneColors.find((g) => g.id === gemstoneColorId)
                : null

              result.push({
                id: generateVariantId(
                  selectedMetal.metalTypeId,
                  colorId,
                  purity.purityId,
                  diamondClarityColorId || undefined,
                  gemstoneColorId || undefined
                ),
                metalTypeId: selectedMetal.metalTypeId,
                metalTypeName: metalType.name,
                metalColorId: colorId,
                metalColorName: color.name,
                metalPurityId: purity.purityId,
                metalPurityName: purityData.name,
                metalWeight: purity.weight,
                diamondClarityColorId: diamondClarityColorId,
                diamondClarityColorName: diamondQuality?.name || null,
                gemstoneColorId: gemstoneColorId,
                gemstoneColorName: gemstoneColor?.name || null,
              })
            }
          }
        }
      }
    }

    return result
  }, [
    canShowVariants,
    metalDetails,
    stoneDetails,
    metalTypes,
    metalColors,
    metalPurities,
    diamondClarityColors,
    gemstoneColors,
  ])

  // Set first variant as default when variants change and no default is set
  useEffect(() => {
    if (variants.length > 0 && defaultVariantId === null) {
      onDefaultVariantChange(variants[0].id)
    }
  }, [variants, defaultVariantId, onDefaultVariantChange])

  // Determine missing requirements message
  const getMissingRequirementsMessage = () => {
    const missing: string[] = []

    if (!metalComplete) {
      missing.push("Metal details (select at least one metal type with color, purity, and weight)")
    }

    if (stoneDetails.hasDiamond && !diamondComplete) {
      missing.push("Diamond clarity/color selection (required when diamonds are enabled)")
    }

    if (stoneDetails.hasGemstone && !gemstoneComplete) {
      missing.push("Gemstone color selection (required when gemstones are enabled)")
    }

    return missing
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variants</CardTitle>
      </CardHeader>
      <CardContent>
        {!canShowVariants ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  Please complete the following sections before variants can be generated:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {getMissingRequirementsMessage().map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {variants.length} variant{variants.length !== 1 ? "s" : ""} generated
            </div>
            <VariantsTable
              variants={variants}
              defaultVariantId={defaultVariantId}
              onDefaultChange={onDefaultVariantChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
