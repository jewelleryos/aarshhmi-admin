"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  fetchSizeChartGroupsForProduct,
  fetchMetalTypesForProduct,
  fetchMetalColorsForProduct,
  fetchMetalPuritiesForProduct,
  fetchStoneShapesForProduct,
  fetchDiamondClarityColorsForProduct,
  fetchDiamondPricingsForProduct,
  fetchGemstoneTypesForProduct,
  fetchGemstoneQualitiesForProduct,
  fetchGemstoneColorsForProduct,
  fetchGemstonePricingsForProduct,
  fetchPearlTypesForProduct,
  fetchPearlQualitiesForProduct,
  fetchBadgesForProduct,
  fetchCategoriesForProduct,
  fetchTagGroupsForProduct,
  fetchTagsForProduct,
} from "@/redux/slices/productSlice"
import productService from "@/redux/services/productService"
import { PRODUCT_TYPES } from "@/configs/product.config"
import { toast } from "sonner"
import { BasicDetailsSection } from "./basic-details-section"
import { MetalDetailsSection, type MetalDetailsErrors } from "./metal-details-section"
import { StoneDetailsSection, type StoneDetailsErrors } from "./stone-details-section"
import { VariantsSection } from "./variants-section"
import { AttributesSection, type AttributesErrors } from "./attributes-section"
import { MediaSection, type MediaDetailsData } from "./media-section"
import { SeoSection } from "./seo-section"

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Tab configuration
const TABS = [
  { id: "basic", label: "Basic Details" },
  { id: "metal", label: "Metal Details" },
  { id: "stone", label: "Stone Details" },
  { id: "variants", label: "Variants" },
  { id: "attributes", label: "Attributes" },
  { id: "media", label: "Media" },
  { id: "seo", label: "SEO" },
] as const

type TabId = (typeof TABS)[number]["id"]

// Initial state for basic details
const initialBasicDetails = {
  title: "",
  slug: "",
  productSku: "",
  styleSku: "",
  shortDescription: "",
  htmlDescription: "",
  width: "",
  height: "",
  length: "",
  hasEngraving: false,
  engravingMaxChars: "",
  hasSizeChart: false,
  sizeChartGroupId: "",
}

// Metal details initial state
const initialMetalDetails = {
  selectedMetals: [] as {
    metalTypeId: string
    colorIds: string[]
    purities: { purityId: string; weight: string }[]
  }[],
}

// Stone details initial state
const initialStoneDetails = {
  hasDiamond: false,
  hasGemstone: false,
  hasPearl: false,
  diamondClarityColorIds: [] as string[],
  diamonds: [] as { id: string; shapeId: string; totalCarat: string; noOfStones: string; pricings: Record<string, string> }[],
  gemstoneQualityId: "" as string,
  gemstoneColorIds: [] as string[],
  gemstones: [] as { id: string; typeId: string; shapeId: string; totalCarat: string; noOfStones: string; pricings: Record<string, string> }[],
  pearls: [] as { id: string; typeId: string; qualityId: string; noOfPearls: string; totalGrams: string; amount: string }[],
}

// Attributes initial state
const initialAttributesDetails = {
  badgeIds: [] as string[],
  categoryIds: [] as string[],
  tagIds: [] as string[],
}

// SEO initial state
const initialSeoDetails = {
  metaTitle: "",
  metaKeywords: "",
  metaDescription: "",
  metaRobots: "",
  metaCanonical: "",
  ogTitle: "",
  ogSiteName: "",
  ogDescription: "",
  ogUrl: "",
  ogImageUrl: "",
  twitterCardTitle: "",
  twitterCardSiteName: "",
  twitterCardDescription: "",
  twitterUrl: "",
  twitterMedia: "",
}

// Media details initial state
const initialMediaDetails: MediaDetailsData = {
  colorMedia: [],
}

export function JewelleryDefaultContent() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Get dropdown data from Redux store
  const {
    sizeChartGroups,
    isLoadingSizeChartGroups,
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
    badges,
    categories,
    tagGroups,
    tags,
  } = useAppSelector((state) => state.product)

  // Fetch all dropdown data on mount
  useEffect(() => {
    // Metal data
    dispatch(fetchSizeChartGroupsForProduct())
    dispatch(fetchMetalTypesForProduct())
    dispatch(fetchMetalColorsForProduct())
    dispatch(fetchMetalPuritiesForProduct())
    // Stone data
    dispatch(fetchStoneShapesForProduct())
    dispatch(fetchDiamondClarityColorsForProduct())
    dispatch(fetchDiamondPricingsForProduct())
    dispatch(fetchGemstoneTypesForProduct())
    dispatch(fetchGemstoneQualitiesForProduct())
    dispatch(fetchGemstoneColorsForProduct())
    dispatch(fetchGemstonePricingsForProduct())
    dispatch(fetchPearlTypesForProduct())
    dispatch(fetchPearlQualitiesForProduct())
    // Attributes data
    dispatch(fetchBadgesForProduct())
    dispatch(fetchCategoriesForProduct())
    dispatch(fetchTagGroupsForProduct())
    dispatch(fetchTagsForProduct())
  }, [dispatch])

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabId>("basic")

  // Basic details state
  const [basicDetails, setBasicDetails] = useState(initialBasicDetails)
  const [basicDetailsErrors, setBasicDetailsErrors] = useState<{
    title?: string
    slug?: string
    productSku?: string
    width?: string
    height?: string
    length?: string
    engravingMaxChars?: string
    sizeChartGroupId?: string
  }>({})

  // Track if slug was manually edited
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Metal details state
  const [metalDetails, setMetalDetails] = useState(initialMetalDetails)
  const [metalDetailsErrors, setMetalDetailsErrors] = useState<MetalDetailsErrors>({})

  // Stone details state
  const [stoneDetails, setStoneDetails] = useState(initialStoneDetails)
  const [stoneDetailsErrors, setStoneDetailsErrors] = useState<StoneDetailsErrors>({})

  // Attributes state
  const [attributesDetails, setAttributesDetails] = useState(initialAttributesDetails)
  const [attributesDetailsErrors, setAttributesDetailsErrors] = useState<AttributesErrors>({})

  // SEO state
  const [seoDetails, setSeoDetails] = useState(initialSeoDetails)

  // Media details state
  const [mediaDetails, setMediaDetails] = useState(initialMediaDetails)

  // Default variant state
  const [defaultVariantId, setDefaultVariantId] = useState<string | null>(null)

  // Loading state for create product
  const [isCreating, setIsCreating] = useState(false)

  // Selected colors for media (extracted from metal details)
  const [selectedColors, setSelectedColors] = useState<{ colorId: string; colorName: string }[]>([])

  // Selected gemstone colors for media (extracted from stone details)
  const [selectedGemstoneColorsForMedia, setSelectedGemstoneColorsForMedia] = useState<{ colorId: string; colorName: string }[]>([])

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

  // Update selected gemstone colors for media when stone details change
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

  // Tabs with validation errors (shown after clicking Create Product)
  const [tabsWithErrors, setTabsWithErrors] = useState<TabId[]>([])

  // Check if section is valid (returns true if valid, false if has errors)
  const isSectionValid = (tabId: TabId): boolean => {
    switch (tabId) {
      case "basic":
        return !!(
          basicDetails.title.trim() &&
          basicDetails.productSku.trim() &&
          basicDetails.width &&
          basicDetails.height &&
          basicDetails.length
        )
      case "metal":
        // Check if at least one metal is selected with at least one color and one purity with weight
        return metalDetails.selectedMetals.some(
          (m) =>
            m.colorIds.length > 0 &&
            m.purities.length > 0 &&
            m.purities.every((p) => p.weight && parseFloat(p.weight) > 0)
        )
      case "stone":
        // Stone is optional - valid if no stones selected OR all selected types are configured
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
        // TODO: Add variants validation - optional for now
        return true
      case "attributes":
        // At least one category must be selected
        return attributesDetails.categoryIds.length > 0
      case "media":
        // TODO: Add media validation - optional for now
        return true
      case "seo":
        // SEO is optional
        return true
      default:
        return true
    }
  }

  // Validate basic details and return field errors
  const validateBasicDetails = () => {
    const fieldErrors: typeof basicDetailsErrors = {}

    if (!basicDetails.title.trim()) {
      fieldErrors.title = "Title is required"
    }
    if (!basicDetails.productSku.trim()) {
      fieldErrors.productSku = "Product SKU is required"
    }
    if (!basicDetails.width) {
      fieldErrors.width = "Width is required"
    }
    if (!basicDetails.height) {
      fieldErrors.height = "Height is required"
    }
    if (!basicDetails.length) {
      fieldErrors.length = "Length is required"
    }
    if (basicDetails.hasEngraving && !basicDetails.engravingMaxChars) {
      fieldErrors.engravingMaxChars = "Maximum characters is required"
    }
    if (basicDetails.hasSizeChart && !basicDetails.sizeChartGroupId) {
      fieldErrors.sizeChartGroupId = "Size chart group is required"
    }

    return fieldErrors
  }

  // Validate metal details and return errors
  const validateMetalDetails = (): MetalDetailsErrors => {
    const errors: MetalDetailsErrors = {}

    // Check if no metal is selected
    if (metalDetails.selectedMetals.length === 0) {
      errors.noMetalSelected = "Select at least one metal"
      return errors
    }

    // Check each selected metal
    const metalErrors: MetalDetailsErrors["metalErrors"] = {}

    metalDetails.selectedMetals.forEach((metal) => {
      const metalError: {
        noColorSelected?: string
        noPuritySelected?: string
        weightErrors?: { [purityId: string]: string }
      } = {}

      // Check if no color is selected
      if (metal.colorIds.length === 0) {
        metalError.noColorSelected = "At least one color must be selected"
      }

      // Check if no purity is selected
      if (metal.purities.length === 0) {
        metalError.noPuritySelected = "At least one purity must be selected"
      }

      // Check weight for each purity
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

  // Validate stone details and return errors
  const validateStoneDetails = (): StoneDetailsErrors => {
    const errors: StoneDetailsErrors = {}

    // Validate diamonds
    if (stoneDetails.hasDiamond) {
      // Check if no clarity/color is selected
      if (stoneDetails.diamondClarityColorIds.length === 0) {
        errors.noClarityColorSelected = "At least one clarity/color must be selected"
      } else if (stoneDetails.diamonds.length === 0) {
        // Clarity/color selected but no diamond added
        errors.noDiamondAdded = "At least one diamond must be added"
      } else {
        // Validate each diamond
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

          // Validate pricing for each selected clarity/color
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
      // Check if no quality is selected
      if (!stoneDetails.gemstoneQualityId) {
        errors.noQualitySelected = "Quality must be selected"
      }

      // Check if no colors are selected
      if (stoneDetails.gemstoneColorIds.length === 0) {
        errors.noColorSelected = "At least one color must be selected"
      }

      // Only validate gemstone entries if quality and colors are selected
      if (stoneDetails.gemstoneQualityId && stoneDetails.gemstoneColorIds.length > 0) {
        if (stoneDetails.gemstones.length === 0) {
          errors.noGemstoneAdded = "At least one gemstone must be added"
        } else {
          // Validate each gemstone
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

            // Validate pricing for each selected color (similar to diamond)
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
        // Validate each pearl
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

  // Validate attributes details and return errors
  const validateAttributesDetails = (): AttributesErrors => {
    const errors: AttributesErrors = {}

    if (attributesDetails.categoryIds.length === 0) {
      errors.categoryIds = "At least one category must be selected"
    }

    return errors
  }

  // Validate all sections and return tabs with errors
  const validateAllSections = (): TabId[] => {
    const errors: TabId[] = []
    TABS.forEach((tab) => {
      if (!isSectionValid(tab.id)) {
        errors.push(tab.id)
      }
    })
    return errors
  }

  // Handle Create Product click
  const handleCreateProduct = async () => {
    // Validate basic details and set field errors
    const basicErrors = validateBasicDetails()
    setBasicDetailsErrors(basicErrors)

    // Validate metal details and set field errors
    const metalErrors = validateMetalDetails()
    setMetalDetailsErrors(metalErrors)

    // Validate stone details and set field errors
    const stoneErrors = validateStoneDetails()
    setStoneDetailsErrors(stoneErrors)

    // Validate attributes details and set field errors
    const attributesErrors = validateAttributesDetails()
    setAttributesDetailsErrors(attributesErrors)

    // Get all tabs with errors
    const tabErrors = validateAllSections()
    setTabsWithErrors(tabErrors)

    // If there are errors, don't proceed (stay on current tab)
    if (tabErrors.length > 0) {
      return
    }

    // Helper to find name by ID
    const findName = <T extends { id: string; name: string }>(items: T[], id: string) =>
      items.find((item) => item.id === id)?.name || null

    // Build comprehensive product data object
    const productData = {
      // Product Type (sent by default for jewellery-default)
      productType: PRODUCT_TYPES.JEWELLERY_DEFAULT.code,

      // Basic Details
      basic: {
        title: basicDetails.title,
        slug: basicDetails.slug,
        productSku: basicDetails.productSku,
        styleSku: basicDetails.styleSku || null,
        shortDescription: basicDetails.shortDescription || null,
        description: basicDetails.htmlDescription || null,
        dimensions: {
          width: basicDetails.width ? parseFloat(basicDetails.width) : null,
          height: basicDetails.height ? parseFloat(basicDetails.height) : null,
          length: basicDetails.length ? parseFloat(basicDetails.length) : null,
        },
        engraving: {
          hasEngraving: basicDetails.hasEngraving,
          maxChars: basicDetails.hasEngraving && basicDetails.engravingMaxChars
            ? parseInt(basicDetails.engravingMaxChars)
            : null,
        },
        sizeChart: {
          hasSizeChart: basicDetails.hasSizeChart,
          sizeChartGroupId: basicDetails.hasSizeChart ? basicDetails.sizeChartGroupId : null,
          sizeChartGroupName: basicDetails.hasSizeChart
            ? findName(sizeChartGroups, basicDetails.sizeChartGroupId)
            : null,
        },
      },

      // Metal Details
      metal: {
        selectedMetals: metalDetails.selectedMetals.map((metal) => ({
          metalTypeId: metal.metalTypeId,
          metalTypeName: findName(metalTypes, metal.metalTypeId),
          colors: metal.colorIds.map((colorId) => ({
            colorId,
            colorName: findName(metalColors, colorId),
          })),
          purities: metal.purities.map((purity) => ({
            purityId: purity.purityId,
            purityName: findName(metalPurities, purity.purityId),
            weight: purity.weight ? parseFloat(purity.weight) : null,
          })),
        })),
      },

      // Stone Details
      stone: {
        // Diamond
        hasDiamond: stoneDetails.hasDiamond,
        diamond: stoneDetails.hasDiamond
          ? {
              clarityColors: stoneDetails.diamondClarityColorIds.map((id) => ({
                id,
                name: findName(diamondClarityColors, id),
              })),
              entries: stoneDetails.diamonds.map((diamond) => ({
                id: diamond.id,
                shapeId: diamond.shapeId,
                shapeName: findName(stoneShapes, diamond.shapeId),
                totalCarat: diamond.totalCarat ? parseFloat(diamond.totalCarat) : null,
                noOfStones: diamond.noOfStones ? parseInt(diamond.noOfStones) : null,
                pricings: Object.entries(diamond.pricings).map(([clarityColorId, pricingId]) => {
                  const pricing = diamondPricings.find((p) => p.id === pricingId)
                  return {
                    clarityColorId,
                    clarityColorName: findName(diamondClarityColors, clarityColorId),
                    pricingId,
                    pricingRange: pricing ? `${pricing.ct_from}-${pricing.ct_to} ct` : null,
                  }
                }),
              })),
            }
          : null,

        // Gemstone
        hasGemstone: stoneDetails.hasGemstone,
        gemstone: stoneDetails.hasGemstone
          ? {
              qualityId: stoneDetails.gemstoneQualityId,
              qualityName: findName(gemstoneQualities, stoneDetails.gemstoneQualityId),
              colors: stoneDetails.gemstoneColorIds.map((id) => ({
                id,
                name: findName(gemstoneColors, id),
              })),
              entries: stoneDetails.gemstones.map((gemstone) => ({
                id: gemstone.id,
                typeId: gemstone.typeId,
                typeName: findName(gemstoneTypes, gemstone.typeId),
                shapeId: gemstone.shapeId,
                shapeName: findName(stoneShapes, gemstone.shapeId),
                totalCarat: gemstone.totalCarat ? parseFloat(gemstone.totalCarat) : null,
                noOfStones: gemstone.noOfStones ? parseInt(gemstone.noOfStones) : null,
                pricings: Object.entries(gemstone.pricings).map(([colorId, pricingId]) => {
                  const pricing = gemstonePricings.find((p) => p.id === pricingId)
                  return {
                    colorId,
                    colorName: findName(gemstoneColors, colorId),
                    pricingId,
                    pricingRange: pricing ? `${pricing.ct_from}-${pricing.ct_to} ct` : null,
                  }
                }),
              })),
            }
          : null,

        // Pearl
        hasPearl: stoneDetails.hasPearl,
        pearl: stoneDetails.hasPearl
          ? {
              entries: stoneDetails.pearls.map((pearl) => ({
                id: pearl.id,
                typeId: pearl.typeId,
                typeName: findName(pearlTypes, pearl.typeId),
                qualityId: pearl.qualityId,
                qualityName: findName(pearlQualities, pearl.qualityId),
                noOfPearls: pearl.noOfPearls ? parseInt(pearl.noOfPearls) : null,
                totalGrams: pearl.totalGrams ? parseFloat(pearl.totalGrams) : null,
                amount: pearl.amount ? parseFloat(pearl.amount) : null,
              })),
            }
          : null,
      },

      // Variants
      variants: {
        defaultVariantId,
        // Generate full variant list for reference
        generatedVariants: (() => {
          const variants: Array<{
            id: string
            metalType: { id: string; name: string | null }
            metalColor: { id: string; name: string | null }
            metalPurity: { id: string; name: string | null; weight: number | null }
            diamondClarityColor: { id: string; name: string | null } | null
            gemstoneColor: { id: string; name: string | null } | null
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
                      metalType: {
                        id: selectedMetal.metalTypeId,
                        name: findName(metalTypes, selectedMetal.metalTypeId),
                      },
                      metalColor: {
                        id: colorId,
                        name: findName(metalColors, colorId),
                      },
                      metalPurity: {
                        id: purity.purityId,
                        name: findName(metalPurities, purity.purityId),
                        weight: purity.weight ? parseFloat(purity.weight) : null,
                      },
                      diamondClarityColor: diamondClarityColorId
                        ? {
                            id: diamondClarityColorId,
                            name: findName(diamondClarityColors, diamondClarityColorId),
                          }
                        : null,
                      gemstoneColor: gemstoneColorId
                        ? {
                            id: gemstoneColorId,
                            name: findName(gemstoneColors, gemstoneColorId),
                          }
                        : null,
                      isDefault: variantId === defaultVariantId,
                    })
                  }
                }
              }
            }
          }

          return variants
        })(),
        totalCount: (() => {
          let count = 0
          const diamondCount =
            stoneDetails.hasDiamond && stoneDetails.diamondClarityColorIds.length > 0
              ? stoneDetails.diamondClarityColorIds.length
              : 1
          const gemstoneCount =
            stoneDetails.hasGemstone && stoneDetails.gemstoneColorIds.length > 0
              ? stoneDetails.gemstoneColorIds.length
              : 1

          for (const selectedMetal of metalDetails.selectedMetals) {
            const validPurities = selectedMetal.purities.filter(
              (p) => p.weight && parseFloat(p.weight) > 0
            ).length
            count +=
              selectedMetal.colorIds.length * validPurities * diamondCount * gemstoneCount
          }
          return count
        })(),
      },

      // Attributes
      attributes: {
        badges: attributesDetails.badgeIds.map((id) => ({
          id,
          name: findName(badges, id),
        })),
        categories: attributesDetails.categoryIds.map((id) => ({
          id,
          name: findName(categories, id),
        })),
        tags: attributesDetails.tagIds.map((id) => ({
          id,
          name: findName(tags, id),
        })),
      },

      // Media
      media: {
        hasGemstoneSubMedia: selectedGemstoneColorsForMedia.length > 0,
        colorMedia: mediaDetails.colorMedia.map((cm) => ({
          metalColorId: cm.colorId,
          metalColorName: cm.colorName,
          // Direct items (when no gemstones)
          items: cm.items.map((item) => ({
            id: item.id,
            path: item.path,
            type: item.type,
            altText: item.altText || null,
            position: item.position,
          })),
          // Gemstone sub-media (when gemstones are selected)
          gemstoneSubMedia: (cm.gemstoneSubMedia || []).map((sm) => ({
            gemstoneColorId: sm.gemstoneColorId,
            gemstoneColorName: sm.gemstoneColorName,
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

      // SEO
      seo: {
        meta: {
          title: seoDetails.metaTitle || null,
          keywords: seoDetails.metaKeywords || null,
          description: seoDetails.metaDescription || null,
          robots: seoDetails.metaRobots || null,
          canonical: seoDetails.metaCanonical || null,
        },
        openGraph: {
          title: seoDetails.ogTitle || null,
          siteName: seoDetails.ogSiteName || null,
          description: seoDetails.ogDescription || null,
          url: seoDetails.ogUrl || null,
          imageUrl: seoDetails.ogImageUrl || null,
        },
        twitter: {
          cardTitle: seoDetails.twitterCardTitle || null,
          siteName: seoDetails.twitterCardSiteName || null,
          description: seoDetails.twitterCardDescription || null,
          url: seoDetails.twitterUrl || null,
          media: seoDetails.twitterMedia || null,
        },
      },
    }

    // Call API to create product
    setIsCreating(true)
    try {
      const response = await productService.create(productData)
      toast.success(response.message)
      router.push("/products")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle basic details change
  const handleBasicDetailsChange = (
    field: keyof typeof basicDetails,
    value: string | boolean
  ) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is updated
    if (basicDetailsErrors[field as keyof typeof basicDetailsErrors]) {
      setBasicDetailsErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Auto-generate slug from title if not manually edited
    if (field === "title" && !slugManuallyEdited && typeof value === "string") {
      setBasicDetails((prev) => ({ ...prev, slug: generateSlug(value) }))
    }

    // Track manual slug edits
    if (field === "slug") {
      setSlugManuallyEdited(true)
    }

    // Clear conditional fields and their errors when toggled off
    if (field === "hasEngraving" && value === false) {
      setBasicDetails((prev) => ({ ...prev, engravingMaxChars: "" }))
      setBasicDetailsErrors((prev) => ({ ...prev, engravingMaxChars: undefined }))
    }
    if (field === "hasSizeChart" && value === false) {
      setBasicDetails((prev) => ({ ...prev, sizeChartGroupId: "" }))
      setBasicDetailsErrors((prev) => ({ ...prev, sizeChartGroupId: undefined }))
    }
  }

  // Handle metal details change - clears errors and resets default variant
  const handleMetalDetailsChange = (newData: typeof metalDetails) => {
    setMetalDetails(newData)
    // Clear metal details errors when data changes
    setMetalDetailsErrors({})
    // Reset default variant when metal details change (will be set to first variant)
    setDefaultVariantId(null)
  }

  // Handle stone details change - clears errors and resets default variant
  const handleStoneDetailsChange = (newData: typeof stoneDetails) => {
    setStoneDetails(newData)
    // Clear stone details errors when data changes
    setStoneDetailsErrors({})
    // Reset default variant when stone details change (will be set to first variant)
    setDefaultVariantId(null)
  }

  // Handle attributes details change - clears errors
  const handleAttributesDetailsChange = (newData: typeof attributesDetails) => {
    setAttributesDetails(newData)
    // Clear attributes errors when data changes
    setAttributesDetailsErrors({})
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <BasicDetailsSection
            data={basicDetails}
            errors={basicDetailsErrors}
            sizeChartGroups={sizeChartGroups}
            isLoadingSizeChartGroups={isLoadingSizeChartGroups}
            onChange={handleBasicDetailsChange}
          />
        )
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
      case "attributes":
        return (
          <AttributesSection
            data={attributesDetails}
            badges={badges}
            categories={categories}
            tagGroups={tagGroups}
            tags={tags}
            errors={attributesDetailsErrors}
            onChange={handleAttributesDetailsChange}
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
      case "seo":
        return (
          <SeoSection
            data={seoDetails}
            onChange={setSeoDetails}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 pb-6">
        <div>
          <h1 className="text-2xl font-semibold">Add Product</h1>
          <p className="text-muted-foreground">
            Create a new jewellery product with options and variants
          </p>
        </div>
        <Button onClick={handleCreateProduct} disabled={isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCreating ? "Creating..." : "Create Product"}
        </Button>
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
                    isActive
                      ? "bg-muted"
                      : "hover:bg-muted"
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
