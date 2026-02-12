"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, ImageIcon, Loader2 } from "lucide-react"
import { formatCurrency } from "@/utils/currency"
import { getCdnUrl } from "@/utils/cdn"
import { productMatchesConditions } from "@/utils/pricing-rule-matcher"
import { calculateNewSellingPrice, extractCostComponents } from "@/utils/pricing-rule-calculator"
import type {
  ProductForPricingPreview,
  PricingRuleCondition,
  PricingRuleActions,
  ApplicableProductResult,
  ConditionState,
  ProductMetadata,
  ColorMedia,
} from "./types"

// Extended variant result with image path
interface ApplicableProductResultWithImage extends ApplicableProductResult {
  imagePath: string | null
}

// Grouped product with its matching variants
interface GroupedProduct {
  productId: string
  productName: string
  productSku: string
  productMetadata: ProductMetadata
  variantCount: number
  // Price range across all matching variants
  minCurrentPrice: number
  maxCurrentPrice: number
  minNewPrice: number
  maxNewPrice: number
  // All matching variants with images
  variants: ApplicableProductResultWithImage[]
}

// Get the first available image from product media
function getFirstProductImage(metadata: ProductMetadata): string | null {
  const colorMedia = metadata?.media?.colorMedia
  if (!colorMedia || colorMedia.length === 0) return null

  // Find first color media with items
  for (const cm of colorMedia) {
    if (cm.items && cm.items.length > 0) {
      // Sort by position and get first
      const sorted = [...cm.items].sort((a, b) => a.position - b.position)
      return sorted[0].path
    }
    // Check gemstone sub-media
    if (cm.gemstoneSubMedia) {
      for (const gsm of cm.gemstoneSubMedia) {
        if (gsm.items && gsm.items.length > 0) {
          const sorted = [...gsm.items].sort((a, b) => a.position - b.position)
          return sorted[0].path
        }
      }
    }
  }

  return null
}

// Get variant image based on metal color slug
function getVariantImage(
  metadata: ProductMetadata,
  metalColorSlug: string | null,
  gemstoneColorSlug: string | null
): string | null {
  const colorMedia = metadata?.media?.colorMedia
  if (!colorMedia || colorMedia.length === 0) return null

  // Find matching color media by metal color ID (which matches slug pattern)
  // The metalColorId in colorMedia is the ID, but we have slug in variant
  // We'll try to match by finding any color media and return its first image
  // A more accurate approach would require a lookup, but for now we'll use position-based matching

  if (metalColorSlug) {
    // Try to find color media that matches (by index position or any available)
    for (const cm of colorMedia) {
      // Check if this color media has gemstone sub-media matching
      if (gemstoneColorSlug && cm.gemstoneSubMedia) {
        for (const gsm of cm.gemstoneSubMedia) {
          if (gsm.items && gsm.items.length > 0) {
            const sorted = [...gsm.items].sort((a, b) => a.position - b.position)
            return sorted[0].path
          }
        }
      }

      // Return items from this color
      if (cm.items && cm.items.length > 0) {
        const sorted = [...cm.items].sort((a, b) => a.position - b.position)
        return sorted[0].path
      }
    }
  }

  // Fallback to first available image
  return getFirstProductImage(metadata)
}

interface PricingRuleApplicableProductsProps {
  products: ProductForPricingPreview[]
  isLoading: boolean
  conditions: ConditionState[]
  actions: PricingRuleActions
}

export function PricingRuleApplicableProducts({
  products,
  isLoading,
  conditions,
  actions,
}: PricingRuleApplicableProductsProps) {
  // Track which products are expanded
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  // Convert ConditionState to PricingRuleCondition (filter out incomplete conditions)
  const validConditions: PricingRuleCondition[] = useMemo(() => {
    return conditions
      .filter((c) => c.type !== null && c.value !== null)
      .map((c) => ({
        type: c.type!,
        value: c.value!,
      }))
  }, [conditions])

  // Calculate applicable products grouped by product
  const groupedProducts = useMemo(() => {
    if (validConditions.length === 0) return []

    const productMap = new Map<string, GroupedProduct>()

    for (const product of products) {
      for (const variant of product.variants) {
        // Check if this variant matches all conditions
        if (productMatchesConditions(product, variant, validConditions)) {
          const currentPrice = variant.price

          // Extract cost components from price_components
          const costComponents = extractCostComponents(variant.price_components as Record<string, unknown>)

          if (costComponents) {
            // Calculate new price: current selling price + additional markup from new rule
            const newPrice = calculateNewSellingPrice(currentPrice, costComponents, actions)
            const difference = newPrice - currentPrice
            const differencePercent = currentPrice > 0
              ? (difference / currentPrice) * 100
              : 0

            // Get variant metadata for image matching
            const variantMeta = variant.metadata as Record<string, unknown>
            const metalColor = (variantMeta?.metalColor as string) || null
            const gemstoneColor = (variantMeta?.gemstoneColor as string) || null

            // Get variant-specific image
            const imagePath = getVariantImage(product.metadata, metalColor, gemstoneColor)

            const variantResult: ApplicableProductResultWithImage = {
              productId: product.id,
              productName: product.name,
              productSku: product.base_sku,
              variantId: variant.id,
              variantSku: variant.sku,
              variantName: variant.variant_name,
              currentSellingPrice: currentPrice,
              newSellingPrice: newPrice,
              priceDifference: difference,
              priceDifferencePercent: differencePercent,
              imagePath,
            }

            // Add to product group
            if (!productMap.has(product.id)) {
              productMap.set(product.id, {
                productId: product.id,
                productName: product.name,
                productSku: product.base_sku,
                productMetadata: product.metadata,
                variantCount: 0,
                minCurrentPrice: currentPrice,
                maxCurrentPrice: currentPrice,
                minNewPrice: newPrice,
                maxNewPrice: newPrice,
                variants: [],
              })
            }

            const group = productMap.get(product.id)!
            group.variants.push(variantResult)
            group.variantCount++
            group.minCurrentPrice = Math.min(group.minCurrentPrice, currentPrice)
            group.maxCurrentPrice = Math.max(group.maxCurrentPrice, currentPrice)
            group.minNewPrice = Math.min(group.minNewPrice, newPrice)
            group.maxNewPrice = Math.max(group.maxNewPrice, newPrice)
          }
        }
      }
    }

    return Array.from(productMap.values())
  }, [products, validConditions, actions])

  // Total variant count
  const totalVariants = useMemo(() => {
    return groupedProducts.reduce((sum, p) => sum + p.variantCount, 0)
  }, [groupedProducts])

  // Toggle product expansion
  const toggleProduct = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  // Format price range
  const formatPriceRange = (min: number, max: number) => {
    if (min === max) {
      return formatCurrency(min)
    }
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicable Products</CardTitle>
        <CardDescription>
          {validConditions.length === 0
            ? "Add conditions to see applicable products"
            : `${groupedProducts.length} product(s) with ${totalVariants} variant(s) match the current conditions`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validConditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Add at least one condition to preview applicable products
          </div>
        ) : groupedProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products match the current conditions
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-2 py-2 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-right">Variants</div>
              <div className="col-span-2 text-right">Current Price</div>
              <div className="col-span-3 text-right">New Price</div>
            </div>

            {/* Product rows */}
            {groupedProducts.map((group) => {
              const isExpanded = expandedProducts.has(group.productId)
              const productImage = getFirstProductImage(group.productMetadata)

              return (
                <div key={group.productId} className="border rounded-lg overflow-hidden">
                  {/* Product row (clickable) */}
                  <div
                    className="grid grid-cols-12 gap-2 px-2 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleProduct(group.productId)}
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      {/* Product Image */}
                      <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted">
                        {productImage ? (
                          <Image
                            src={getCdnUrl(productImage)}
                            alt={group.productName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{group.productName}</div>
                        <div className="text-xs text-muted-foreground">{group.productSku}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-right self-center">
                      <span className="text-sm text-muted-foreground">
                        {group.variantCount} variant{group.variantCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="col-span-2 text-right self-center text-sm">
                      {formatPriceRange(group.minCurrentPrice, group.maxCurrentPrice)}
                    </div>
                    <div className="col-span-3 text-right self-center text-sm font-medium">
                      {formatPriceRange(group.minNewPrice, group.maxNewPrice)}
                    </div>
                  </div>

                  {/* Expanded variants with smooth transition */}
                  <div
                    className={`border-t bg-muted/30 overflow-hidden transition-all duration-200 ease-in-out ${
                      isExpanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0 border-t-0"
                    }`}
                  >
                      {/* Variant header */}
                      <div className="grid grid-cols-12 gap-2 px-2 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/50">
                        <div className="col-span-5 pl-6">Variant</div>
                        <div className="col-span-2 text-right">Current</div>
                        <div className="col-span-2 text-right">New</div>
                        <div className="col-span-3 text-right">Difference</div>
                      </div>

                      {/* Variant rows */}
                      {group.variants.map((variant) => (
                        <div
                          key={variant.variantId}
                          className="grid grid-cols-12 gap-2 px-2 py-2 text-sm border-b last:border-b-0 items-center"
                        >
                          <div className="col-span-5 pl-6 flex items-center gap-2">
                            {/* Variant Image */}
                            <div className="relative h-8 w-8 shrink-0 rounded overflow-hidden bg-muted">
                              {variant.imagePath ? (
                                <Image
                                  src={getCdnUrl(variant.imagePath)}
                                  alt={variant.variantName || variant.variantSku}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>{variant.variantName || variant.variantSku}</div>
                          </div>
                          <div className="col-span-2 text-right text-muted-foreground">
                            {formatCurrency(variant.currentSellingPrice)}
                          </div>
                          <div className="col-span-2 text-right font-medium">
                            {formatCurrency(variant.newSellingPrice)}
                          </div>
                          <div className="col-span-3 text-right">
                            <span className={variant.priceDifference >= 0 ? "text-green-600" : "text-red-600"}>
                              {variant.priceDifference >= 0 ? "+" : ""}
                              {formatCurrency(Math.abs(variant.priceDifference))}
                              <span className="text-xs ml-1">
                                ({variant.priceDifferencePercent >= 0 ? "+" : ""}
                                {variant.priceDifferencePercent.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
