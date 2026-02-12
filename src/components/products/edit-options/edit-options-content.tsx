"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  fetchMetalTypesForProductEdit,
  fetchMetalColorsForProductEdit,
  fetchMetalPuritiesForProductEdit,
  fetchStoneShapesForProductEdit,
  fetchDiamondClarityColorsForProductEdit,
  fetchDiamondPricingsForProductEdit,
  fetchGemstoneTypesForProductEdit,
  fetchGemstoneQualitiesForProductEdit,
  fetchGemstoneColorsForProductEdit,
  fetchGemstonePricingsForProductEdit,
  fetchPearlTypesForProductEdit,
  fetchPearlQualitiesForProductEdit,
} from "@/redux/slices/productSlice"
import productService, { type ProductDetail } from "@/redux/services/productService"
import { toast } from "sonner"
import { MetalDetailsSection, type MetalDetailsErrors } from "@/components/add-product/jewellery-default/metal-details-section"
import { StoneDetailsSection, type StoneDetailsErrors } from "@/components/add-product/jewellery-default/stone-details-section"
import { VariantsSection } from "@/components/add-product/jewellery-default/variants-section"
import { MediaSection, type MediaDetailsData } from "@/components/add-product/jewellery-default/media-section"

// Tab configuration - only 4 tabs for options edit
const TABS = [
  { id: "metal", label: "Metal Details" },
  { id: "stone", label: "Stone Details" },
  { id: "variants", label: "Variants" },
  { id: "media", label: "Media" },
] as const

type TabId = (typeof TABS)[number]["id"]

// Metal details state type
interface MetalDetailsState {
  selectedMetals: {
    metalTypeId: string
    colorIds: string[]
    purities: { purityId: string; weight: string }[]
  }[]
}

// Stone details state type
interface StoneDetailsState {
  hasDiamond: boolean
  hasGemstone: boolean
  hasPearl: boolean
  diamondClarityColorIds: string[]
  diamonds: { id: string; shapeId: string; totalCarat: string; noOfStones: string; pricings: Record<string, string> }[]
  gemstoneQualityId: string
  gemstoneColorIds: string[]
  gemstones: { id: string; typeId: string; shapeId: string; totalCarat: string; noOfStones: string; pricings: Record<string, string> }[]
  pearls: { id: string; typeId: string; qualityId: string; noOfPearls: string; totalGrams: string; amount: string }[]
}

// Initial states
const initialMetalDetails: MetalDetailsState = {
  selectedMetals: [],
}

const initialStoneDetails: StoneDetailsState = {
  hasDiamond: false,
  hasGemstone: false,
  hasPearl: false,
  diamondClarityColorIds: [],
  diamonds: [],
  gemstoneQualityId: "",
  gemstoneColorIds: [],
  gemstones: [],
  pearls: [],
}

const initialMediaDetails: MediaDetailsData = {
  colorMedia: [],
}

interface EditOptionsContentProps {
  productId: string
}

export function EditOptionsContent({ productId }: EditOptionsContentProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Get dropdown data from Redux store
  const {
    metalTypes,
    metalColors,
    metalPurities,
    isLoadingMetalTypes,
    isLoadingMetalColors,
    isLoadingMetalPurities,
    stoneShapes,
    diamondClarityColors,
    diamondPricings,
    gemstoneTypes,
    gemstoneQualities,
    gemstoneColors,
    gemstonePricings,
    pearlTypes,
    pearlQualities,
  } = useAppSelector((state) => state.product)

  // Product data state
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownsLoaded, setIsDropdownsLoaded] = useState(false)

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabId>("metal")

  // Form state
  const [metalDetails, setMetalDetails] = useState<MetalDetailsState>(initialMetalDetails)
  const [metalDetailsErrors, setMetalDetailsErrors] = useState<MetalDetailsErrors>({})
  const [stoneDetails, setStoneDetails] = useState<StoneDetailsState>(initialStoneDetails)
  const [stoneDetailsErrors, setStoneDetailsErrors] = useState<StoneDetailsErrors>({})
  const [mediaDetails, setMediaDetails] = useState<MediaDetailsData>(initialMediaDetails)
  const [defaultVariantId, setDefaultVariantId] = useState<string | null>(null)

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Selected colors for media
  const [selectedColors, setSelectedColors] = useState<{ colorId: string; colorName: string }[]>([])
  const [selectedGemstoneColorsForMedia, setSelectedGemstoneColorsForMedia] = useState<{ colorId: string; colorName: string }[]>([])

  // Tabs with validation errors
  const [tabsWithErrors, setTabsWithErrors] = useState<TabId[]>([])

  // Fetch dropdown data on mount (using edit endpoints with PRODUCT.UPDATE permission)
  useEffect(() => {
    Promise.all([
      dispatch(fetchMetalTypesForProductEdit()),
      dispatch(fetchMetalColorsForProductEdit()),
      dispatch(fetchMetalPuritiesForProductEdit()),
      dispatch(fetchStoneShapesForProductEdit()),
      dispatch(fetchDiamondClarityColorsForProductEdit()),
      dispatch(fetchDiamondPricingsForProductEdit()),
      dispatch(fetchGemstoneTypesForProductEdit()),
      dispatch(fetchGemstoneQualitiesForProductEdit()),
      dispatch(fetchGemstoneColorsForProductEdit()),
      dispatch(fetchGemstonePricingsForProductEdit()),
      dispatch(fetchPearlTypesForProductEdit()),
      dispatch(fetchPearlQualitiesForProductEdit()),
    ]).then(() => {
      setIsDropdownsLoaded(true)
    })
  }, [dispatch])

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await productService.getById(productId)
        setProduct(response.data)
      } catch (error) {
        toast.error("Failed to load product")
        router.push(`/products/${productId}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [productId, router])

  // Initialize form state from product metadata when both product and dropdowns are loaded
  useEffect(() => {
    if (!product || !isDropdownsLoaded) return

    const metadata = product.metadata as Record<string, unknown>

    // Initialize metal details from metadata.availableMetals
    if (metadata?.availableMetals) {
      const availableMetals = metadata.availableMetals as Array<{
        metalTypeId: string
        colors: { colorId: string }[]
        purities: { purityId: string; weight: number }[]
      }>

      setMetalDetails({
        selectedMetals: availableMetals.map((metal) => ({
          metalTypeId: metal.metalTypeId,
          colorIds: metal.colors.map((c) => c.colorId),
          purities: metal.purities.map((p) => ({
            purityId: p.purityId,
            weight: String(p.weight),
          })),
        })),
      })
    }

    // Initialize stone details from metadata.stone
    if (metadata?.stone) {
      const stone = metadata.stone as {
        hasDiamond: boolean
        diamond?: {
          clarityColors: { id: string }[]
          entries: {
            id?: string
            shapeId: string
            totalCarat: number
            noOfStones: number
            pricings: { clarityColorId: string; pricingId: string }[]
          }[]
        }
        hasGemstone: boolean
        gemstone?: {
          qualityId: string
          colors: { id: string }[]
          entries: {
            id?: string
            typeId: string
            shapeId: string
            totalCarat: number
            noOfStones: number
            pricings: { colorId: string; pricingId: string }[]
          }[]
        }
        hasPearl: boolean
        pearl?: {
          entries: {
            id?: string
            typeId: string
            qualityId: string
            noOfPearls: number
            totalGrams: number
            amount: number
          }[]
        }
      }

      setStoneDetails({
        hasDiamond: stone.hasDiamond,
        diamondClarityColorIds: stone.diamond?.clarityColors.map((c) => c.id) || [],
        diamonds: stone.diamond?.entries.map((d, i) => ({
          id: d.id || `diamond-${i}`,
          shapeId: d.shapeId,
          totalCarat: String(d.totalCarat),
          noOfStones: String(d.noOfStones),
          pricings: d.pricings.reduce((acc, p) => ({ ...acc, [p.clarityColorId]: p.pricingId }), {} as Record<string, string>),
        })) || [],
        hasGemstone: stone.hasGemstone,
        gemstoneQualityId: stone.gemstone?.qualityId || "",
        gemstoneColorIds: stone.gemstone?.colors.map((c) => c.id) || [],
        gemstones: stone.gemstone?.entries.map((g, i) => ({
          id: g.id || `gemstone-${i}`,
          typeId: g.typeId,
          shapeId: g.shapeId,
          totalCarat: String(g.totalCarat),
          noOfStones: String(g.noOfStones),
          pricings: g.pricings.reduce((acc, p) => ({ ...acc, [p.colorId]: p.pricingId }), {} as Record<string, string>),
        })) || [],
        hasPearl: stone.hasPearl,
        pearls: stone.pearl?.entries.map((p, i) => ({
          id: p.id || `pearl-${i}`,
          typeId: p.typeId,
          qualityId: p.qualityId,
          noOfPearls: String(p.noOfPearls),
          totalGrams: String(p.totalGrams),
          amount: String(p.amount),
        })) || [],
      })
    }

    // Initialize media details from metadata.media
    if (metadata?.media) {
      const media = metadata.media as {
        colorMedia: {
          metalColorId: string
          items: { id: string; path: string; type: string; altText: string | null; position: number }[]
          gemstoneSubMedia?: {
            gemstoneColorId: string
            items: { id: string; path: string; type: string; altText: string | null; position: number }[]
          }[]
        }[]
      }

      setMediaDetails({
        colorMedia: media.colorMedia.map((cm) => {
          const metalColor = metalColors.find((c) => c.id === cm.metalColorId)
          return {
            colorId: cm.metalColorId,
            colorName: metalColor?.name || cm.metalColorId,
            items: cm.items.map((item) => ({
              id: item.id,
              path: item.path,
              type: item.type as "image" | "video",
              altText: item.altText || "",
              position: item.position,
            })),
            gemstoneSubMedia: (cm.gemstoneSubMedia || []).map((gsm) => {
              const gemColor = gemstoneColors.find((c) => c.id === gsm.gemstoneColorId)
              return {
                gemstoneColorId: gsm.gemstoneColorId,
                gemstoneColorName: gemColor?.name || gsm.gemstoneColorId,
                items: gsm.items.map((item) => ({
                  id: item.id,
                  path: item.path,
                  type: item.type as "image" | "video",
                  altText: item.altText || "",
                  position: item.position,
                })),
              }
            }),
          }
        }),
      })
    }

    // Set default variant ID
    if (product.default_variant_id) {
      // Try to reconstruct the variant ID format used in the form
      const defaultVariant = product.variants.find((v) => v.id === product.default_variant_id)
      if (defaultVariant?.metadata) {
        const m = defaultVariant.metadata as Record<string, string | undefined>
        const variantId = [
          m.metalType,
          m.metalColor,
          m.metalPurity,
          m.diamondClarityColor,
          m.gemstoneColor,
        ]
          .filter(Boolean)
          .join("-")
        setDefaultVariantId(variantId)
      }
    }
  }, [product, isDropdownsLoaded, metalColors, gemstoneColors])

  // Update selected colors when metal details change
  useEffect(() => {
    const colorIds = new Set<string>()
    const colors: { colorId: string; colorName: string }[] = []

    metalDetails.selectedMetals.forEach((metal) => {
      metal.colorIds.forEach((colorId) => {
        if (!colorIds.has(colorId)) {
          colorIds.add(colorId)
          const color = metalColors.find((c) => c.id === colorId)
          if (color) {
            colors.push({ colorId: color.id, colorName: color.name })
          }
        }
      })
    })

    setSelectedColors(colors)
  }, [metalDetails, metalColors])

  // Update selected gemstone colors for media
  useEffect(() => {
    if (stoneDetails.hasGemstone && stoneDetails.gemstoneColorIds.length > 0) {
      const colors: { colorId: string; colorName: string }[] = []
      stoneDetails.gemstoneColorIds.forEach((colorId) => {
        const color = gemstoneColors.find((c) => c.id === colorId)
        if (color) {
          colors.push({ colorId: color.id, colorName: color.name })
        }
      })
      setSelectedGemstoneColorsForMedia(colors)
    } else {
      setSelectedGemstoneColorsForMedia([])
    }
  }, [stoneDetails.hasGemstone, stoneDetails.gemstoneColorIds, gemstoneColors])

  // Check if section is valid
  const isSectionValid = (tabId: TabId): boolean => {
    switch (tabId) {
      case "metal":
        return metalDetails.selectedMetals.some(
          (m) =>
            m.colorIds.length > 0 &&
            m.purities.length > 0 &&
            m.purities.every((p) => p.weight && parseFloat(p.weight) > 0)
        )
      case "stone":
        if (!stoneDetails.hasDiamond && !stoneDetails.hasGemstone && !stoneDetails.hasPearl) {
          return true
        }
        const hasDiamondConfigured =
          !stoneDetails.hasDiamond ||
          (stoneDetails.diamondClarityColorIds.length > 0 &&
            stoneDetails.diamonds.length > 0 &&
            stoneDetails.diamonds.every(
              (d) =>
                d.shapeId &&
                d.totalCarat &&
                d.noOfStones &&
                stoneDetails.diamondClarityColorIds.every((ccId) => d.pricings[ccId])
            ))
        const hasGemstoneConfigured =
          !stoneDetails.hasGemstone ||
          (!!stoneDetails.gemstoneQualityId &&
            stoneDetails.gemstoneColorIds.length > 0 &&
            stoneDetails.gemstones.length > 0 &&
            stoneDetails.gemstones.every(
              (g) =>
                g.typeId &&
                g.shapeId &&
                g.totalCarat &&
                g.noOfStones &&
                stoneDetails.gemstoneColorIds.every((colorId) => g.pricings[colorId])
            ))
        const hasPearlConfigured =
          !stoneDetails.hasPearl ||
          (stoneDetails.pearls.length > 0 &&
            stoneDetails.pearls.every(
              (p) =>
                p.typeId &&
                p.qualityId &&
                p.noOfPearls &&
                p.totalGrams &&
                p.amount
            ))
        return hasDiamondConfigured && hasGemstoneConfigured && hasPearlConfigured
      case "variants":
        return true
      case "media":
        return true
      default:
        return true
    }
  }

  // Validate metal details
  const validateMetalDetails = (): MetalDetailsErrors => {
    const errors: MetalDetailsErrors = {}

    if (metalDetails.selectedMetals.length === 0) {
      errors.noMetalSelected = "Select at least one metal"
      return errors
    }

    const metalErrors: MetalDetailsErrors["metalErrors"] = {}

    metalDetails.selectedMetals.forEach((metal) => {
      const metalError: {
        noColorSelected?: string
        noPuritySelected?: string
        weightErrors?: { [purityId: string]: string }
      } = {}

      if (metal.colorIds.length === 0) {
        metalError.noColorSelected = "At least one color must be selected"
      }

      if (metal.purities.length === 0) {
        metalError.noPuritySelected = "At least one purity must be selected"
      }

      if (metal.purities.length > 0) {
        const weightErrors: { [purityId: string]: string } = {}
        metal.purities.forEach((purity) => {
          if (!purity.weight || parseFloat(purity.weight) <= 0) {
            weightErrors[purity.purityId] = "Weight is required"
          }
        })
        if (Object.keys(weightErrors).length > 0) {
          metalError.weightErrors = weightErrors
        }
      }

      if (Object.keys(metalError).length > 0) {
        metalErrors[metal.metalTypeId] = metalError
      }
    })

    if (Object.keys(metalErrors).length > 0) {
      errors.metalErrors = metalErrors
    }

    return errors
  }

  // Validate stone details
  const validateStoneDetails = (): StoneDetailsErrors => {
    const errors: StoneDetailsErrors = {}

    // Validate diamonds
    if (stoneDetails.hasDiamond) {
      if (stoneDetails.diamondClarityColorIds.length === 0) {
        errors.noClarityColorSelected = "At least one clarity/color must be selected"
      } else if (stoneDetails.diamonds.length === 0) {
        errors.noDiamondAdded = "At least one diamond must be added"
      } else {
        const diamondErrors: StoneDetailsErrors["diamondErrors"] = {}

        stoneDetails.diamonds.forEach((diamond) => {
          const diamondError: {
            shapeId?: string
            totalCarat?: string
            noOfStones?: string
            pricingErrors?: { [clarityColorId: string]: string }
          } = {}

          if (!diamond.shapeId) {
            diamondError.shapeId = "Shape is required"
          }
          if (!diamond.totalCarat || parseFloat(diamond.totalCarat) <= 0) {
            diamondError.totalCarat = "Total carat is required"
          }
          if (!diamond.noOfStones || parseInt(diamond.noOfStones) <= 0) {
            diamondError.noOfStones = "No. of stones is required"
          }

          if (diamond.shapeId) {
            const pricingErrors: { [clarityColorId: string]: string } = {}

            stoneDetails.diamondClarityColorIds.forEach((ccId) => {
              const pricingOptions = diamondPricings.filter(
                (p) => p.stone_quality_id === ccId && p.stone_shape_id === diamond.shapeId
              )

              if (pricingOptions.length === 0) {
                pricingErrors[ccId] = "Add diamond pricing first"
              } else if (!diamond.pricings[ccId]) {
                pricingErrors[ccId] = "Select pricing"
              }
            })

            if (Object.keys(pricingErrors).length > 0) {
              diamondError.pricingErrors = pricingErrors
            }
          }

          if (Object.keys(diamondError).length > 0) {
            diamondErrors[diamond.id] = diamondError
          }
        })

        if (Object.keys(diamondErrors).length > 0) {
          errors.diamondErrors = diamondErrors
        }
      }
    }

    // Validate gemstones
    if (stoneDetails.hasGemstone) {
      if (!stoneDetails.gemstoneQualityId) {
        errors.noQualitySelected = "Quality must be selected"
      }

      if (stoneDetails.gemstoneColorIds.length === 0) {
        errors.noColorSelected = "At least one color must be selected"
      }

      if (stoneDetails.gemstoneQualityId && stoneDetails.gemstoneColorIds.length > 0) {
        if (stoneDetails.gemstones.length === 0) {
          errors.noGemstoneAdded = "At least one gemstone must be added"
        } else {
          const gemstoneErrors: StoneDetailsErrors["gemstoneErrors"] = {}

          stoneDetails.gemstones.forEach((gemstone) => {
            const gemstoneError: {
              typeId?: string
              shapeId?: string
              totalCarat?: string
              noOfStones?: string
              pricingErrors?: { [colorId: string]: string }
            } = {}

            if (!gemstone.typeId) {
              gemstoneError.typeId = "Gemstone type is required"
            }
            if (!gemstone.shapeId) {
              gemstoneError.shapeId = "Shape is required"
            }
            if (!gemstone.totalCarat || parseFloat(gemstone.totalCarat) <= 0) {
              gemstoneError.totalCarat = "Total carat is required"
            }
            if (!gemstone.noOfStones || parseInt(gemstone.noOfStones) <= 0) {
              gemstoneError.noOfStones = "No. of stones is required"
            }

            if (gemstone.typeId && gemstone.shapeId) {
              const pricingErrors: { [colorId: string]: string } = {}

              stoneDetails.gemstoneColorIds.forEach((colorId) => {
                const pricingOptions = gemstonePricings.filter(
                  (p) =>
                    p.stone_type_id === gemstone.typeId &&
                    p.stone_shape_id === gemstone.shapeId &&
                    p.stone_quality_id === stoneDetails.gemstoneQualityId &&
                    p.stone_color_id === colorId
                )

                if (pricingOptions.length === 0) {
                  pricingErrors[colorId] = "Add pricing first"
                } else if (!gemstone.pricings[colorId]) {
                  pricingErrors[colorId] = "Select pricing"
                }
              })

              if (Object.keys(pricingErrors).length > 0) {
                gemstoneError.pricingErrors = pricingErrors
              }
            }

            if (Object.keys(gemstoneError).length > 0) {
              gemstoneErrors[gemstone.id] = gemstoneError
            }
          })

          if (Object.keys(gemstoneErrors).length > 0) {
            errors.gemstoneErrors = gemstoneErrors
          }
        }
      }
    }

    // Validate pearls
    if (stoneDetails.hasPearl) {
      if (stoneDetails.pearls.length === 0) {
        errors.noPearlAdded = "At least one pearl must be added"
      } else {
        const pearlErrors: StoneDetailsErrors["pearlErrors"] = {}

        stoneDetails.pearls.forEach((pearl) => {
          const pearlError: {
            typeId?: string
            qualityId?: string
            noOfPearls?: string
            totalGrams?: string
            amount?: string
          } = {}

          if (!pearl.typeId) {
            pearlError.typeId = "Pearl type is required"
          }
          if (!pearl.qualityId) {
            pearlError.qualityId = "Pearl quality is required"
          }
          if (!pearl.noOfPearls || parseInt(pearl.noOfPearls) <= 0) {
            pearlError.noOfPearls = "No. of pearls is required"
          }
          if (!pearl.totalGrams || parseFloat(pearl.totalGrams) <= 0) {
            pearlError.totalGrams = "Total grams is required"
          }
          if (!pearl.amount || parseFloat(pearl.amount) <= 0) {
            pearlError.amount = "Amount is required"
          }

          if (Object.keys(pearlError).length > 0) {
            pearlErrors[pearl.id] = pearlError
          }
        })

        if (Object.keys(pearlErrors).length > 0) {
          errors.pearlErrors = pearlErrors
        }
      }
    }

    return errors
  }

  // Validate all sections
  const validateAllSections = (): TabId[] => {
    const errors: TabId[] = []
    TABS.forEach((tab) => {
      if (!isSectionValid(tab.id)) {
        errors.push(tab.id)
      }
    })
    return errors
  }

  // Handle save
  const handleSave = async () => {
    // Validate metal details
    const metalErrors = validateMetalDetails()
    setMetalDetailsErrors(metalErrors)

    // Validate stone details
    const stoneErrors = validateStoneDetails()
    setStoneDetailsErrors(stoneErrors)

    // Get all tabs with errors
    const tabErrors = validateAllSections()
    setTabsWithErrors(tabErrors)

    // If there are errors, don't proceed
    if (tabErrors.length > 0) {
      return
    }

    // Build request data
    const requestData = {
      metal: {
        selectedMetals: metalDetails.selectedMetals.map((metal) => ({
          metalTypeId: metal.metalTypeId,
          colors: metal.colorIds.map((colorId) => ({ colorId })),
          purities: metal.purities.map((purity) => ({
            purityId: purity.purityId,
            weight: parseFloat(purity.weight),
          })),
        })),
      },
      stone: {
        hasDiamond: stoneDetails.hasDiamond,
        diamond: stoneDetails.hasDiamond
          ? {
              clarityColors: stoneDetails.diamondClarityColorIds.map((id) => ({ id })),
              entries: stoneDetails.diamonds.map((diamond) => ({
                shapeId: diamond.shapeId,
                totalCarat: parseFloat(diamond.totalCarat),
                noOfStones: parseInt(diamond.noOfStones),
                pricings: Object.entries(diamond.pricings).map(([clarityColorId, pricingId]) => ({
                  clarityColorId,
                  pricingId,
                })),
              })),
            }
          : null,
        hasGemstone: stoneDetails.hasGemstone,
        gemstone: stoneDetails.hasGemstone
          ? {
              qualityId: stoneDetails.gemstoneQualityId,
              colors: stoneDetails.gemstoneColorIds.map((id) => ({ id })),
              entries: stoneDetails.gemstones.map((gemstone) => ({
                typeId: gemstone.typeId,
                shapeId: gemstone.shapeId,
                totalCarat: parseFloat(gemstone.totalCarat),
                noOfStones: parseInt(gemstone.noOfStones),
                pricings: Object.entries(gemstone.pricings).map(([colorId, pricingId]) => ({
                  colorId,
                  pricingId,
                })),
              })),
            }
          : null,
        hasPearl: stoneDetails.hasPearl,
        pearl: stoneDetails.hasPearl
          ? {
              entries: stoneDetails.pearls.map((pearl) => ({
                typeId: pearl.typeId,
                qualityId: pearl.qualityId,
                noOfPearls: parseInt(pearl.noOfPearls),
                totalGrams: parseFloat(pearl.totalGrams),
                amount: parseFloat(pearl.amount),
              })),
            }
          : null,
      },
      variants: (() => {
        // Generate variants first
        const variants: Array<{
          id: string
          metalType: { id: string }
          metalColor: { id: string }
          metalPurity: { id: string; weight: number }
          diamondClarityColor: { id: string } | null
          gemstoneColor: { id: string } | null
          isDefault: boolean
        }> = []

        const diamondOptions =
          stoneDetails.hasDiamond && stoneDetails.diamondClarityColorIds.length > 0
            ? stoneDetails.diamondClarityColorIds
            : [null]

        const gemstoneColorOptions =
          stoneDetails.hasGemstone && stoneDetails.gemstoneColorIds.length > 0
            ? stoneDetails.gemstoneColorIds
            : [null]

        for (const selectedMetal of metalDetails.selectedMetals) {
          for (const colorId of selectedMetal.colorIds) {
            for (const purity of selectedMetal.purities) {
              if (!purity.weight || parseFloat(purity.weight) <= 0) continue

              for (const diamondClarityColorId of diamondOptions) {
                for (const gemstoneColorId of gemstoneColorOptions) {
                  const variantId = [
                    selectedMetal.metalTypeId,
                    colorId,
                    purity.purityId,
                    diamondClarityColorId,
                    gemstoneColorId,
                  ]
                    .filter(Boolean)
                    .join("-")

                  variants.push({
                    id: variantId,
                    metalType: { id: selectedMetal.metalTypeId },
                    metalColor: { id: colorId },
                    metalPurity: { id: purity.purityId, weight: parseFloat(purity.weight) },
                    diamondClarityColor: diamondClarityColorId ? { id: diamondClarityColorId } : null,
                    gemstoneColor: gemstoneColorId ? { id: gemstoneColorId } : null,
                    isDefault: variantId === defaultVariantId,
                  })
                }
              }
            }
          }
        }

        // If no default is set, make the first variant default
        if (variants.length > 0 && !variants.some((v) => v.isDefault)) {
          variants[0].isDefault = true
        }

        // Use the default variant's ID, or fall back to the first variant's ID
        const finalDefaultVariantId = defaultVariantId || (variants.length > 0 ? variants[0].id : "")

        return {
          defaultVariantId: finalDefaultVariantId,
          generatedVariants: variants,
        }
      })(),
      media: {
        colorMedia: mediaDetails.colorMedia.map((cm) => ({
          metalColorId: cm.colorId,
          items: cm.items.map((item) => ({
            id: item.id,
            path: item.path,
            type: item.type,
            altText: item.altText || null,
            position: item.position,
          })),
          gemstoneSubMedia: (cm.gemstoneSubMedia || []).map((sm) => ({
            gemstoneColorId: sm.gemstoneColorId,
            items: sm.items.map((item) => ({
              id: item.id,
              path: item.path,
              type: item.type,
              altText: item.altText || null,
              position: item.position,
            })),
          })),
        })),
      },
    }

    setIsSubmitting(true)
    try {
      const response = await productService.updateOptions(productId, requestData)
      toast.success(response.message)
      router.push(`/products/${productId}`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle metal details change
  const handleMetalDetailsChange = (newData: MetalDetailsState) => {
    setMetalDetails(newData)
    setMetalDetailsErrors({})
    setDefaultVariantId(null)
  }

  // Handle stone details change
  const handleStoneDetailsChange = (newData: StoneDetailsState) => {
    setStoneDetails(newData)
    setStoneDetailsErrors({})
    setDefaultVariantId(null)
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "metal":
        return (
          <MetalDetailsSection
            data={metalDetails}
            metalTypes={metalTypes}
            metalColors={metalColors}
            metalPurities={metalPurities}
            errors={metalDetailsErrors}
            isLoadingMetalTypes={isLoadingMetalTypes}
            isLoadingMetalColors={isLoadingMetalColors}
            isLoadingMetalPurities={isLoadingMetalPurities}
            onChange={handleMetalDetailsChange}
          />
        )
      case "stone":
        return (
          <StoneDetailsSection
            data={stoneDetails}
            diamondClarityColors={diamondClarityColors}
            diamondPricings={diamondPricings}
            stoneShapes={stoneShapes}
            gemstoneTypes={gemstoneTypes}
            gemstoneQualities={gemstoneQualities}
            gemstoneColors={gemstoneColors}
            gemstonePricings={gemstonePricings}
            pearlTypes={pearlTypes}
            pearlQualities={pearlQualities}
            errors={stoneDetailsErrors}
            onChange={handleStoneDetailsChange}
          />
        )
      case "variants":
        return (
          <VariantsSection
            metalDetails={metalDetails}
            stoneDetails={stoneDetails}
            metalTypes={metalTypes}
            metalColors={metalColors}
            metalPurities={metalPurities}
            diamondClarityColors={diamondClarityColors}
            gemstoneColors={gemstoneColors}
            defaultVariantId={defaultVariantId}
            onDefaultVariantChange={setDefaultVariantId}
          />
        )
      case "media":
        return (
          <MediaSection
            data={mediaDetails}
            selectedColors={selectedColors}
            selectedGemstoneColors={selectedGemstoneColorsForMedia}
            onChange={setMediaDetails}
          />
        )
      default:
        return null
    }
  }

  // Loading state
  if (isLoading || !isDropdownsLoaded) {
    return (
      <div className="flex flex-col h-[calc(100vh-(--spacing(16)))]">
        <div className="flex items-center justify-between shrink-0 pb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-6 flex-1 min-h-0">
          <div className="w-48 shrink-0">
            <div className="flex flex-col gap-2">
              {TABS.map((tab) => (
                <Skeleton key={tab.id} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-(--spacing(16)))]">
        <p className="text-muted-foreground">Product not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-(--spacing(16)))]">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/products/${productId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Product Options</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/products/${productId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Vertical Tabs Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="flex flex-col gap-1 sticky top-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const hasError = tabsWithErrors.includes(tab.id)

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-left transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <span>{tab.label}</span>
                  {hasError && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                      <AlertCircle className="h-3 w-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 min-w-0 overflow-y-auto pr-2">{renderTabContent()}</div>
      </div>
    </div>
  )
}
