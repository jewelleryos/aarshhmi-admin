/**
 * Pricing Rule Condition Matcher
 * Matches products/variants against pricing rule conditions
 */

import type {
  PricingRuleCondition,
  CategoryConditionValue,
  TagsConditionValue,
  BadgesConditionValue,
  MetalWeightConditionValue,
  DiamondCaratConditionValue,
  MetalTypeConditionValue,
  MetalColorConditionValue,
  MetalPurityConditionValue,
  DiamondClarityColorConditionValue,
  GemstoneCaratConditionValue,
  PearlGramConditionValue,
} from '@/components/pricing-rule/types'
import type { ProductForPricingPreview, VariantForPricingPreview } from '@/components/pricing-rule/types'

/**
 * Check if a product/variant matches ALL conditions (AND logic)
 *
 * @param product - Product with categories, tags, badges
 * @param variant - Variant with metadata
 * @param conditions - Array of conditions to check
 * @returns true if all conditions match
 */
export function productMatchesConditions(
  product: ProductForPricingPreview,
  variant: VariantForPricingPreview,
  conditions: PricingRuleCondition[]
): boolean {
  // If no conditions, nothing matches
  if (conditions.length === 0) return false

  // ALL conditions must match (AND logic)
  return conditions.every(condition =>
    matchSingleCondition(product, variant, condition)
  )
}

function matchSingleCondition(
  product: ProductForPricingPreview,
  variant: VariantForPricingPreview,
  condition: PricingRuleCondition
): boolean {
  switch (condition.type) {
    case 'category':
      return matchCategory(product, condition.value as CategoryConditionValue)

    case 'tags':
      return matchTags(product, condition.value as TagsConditionValue)

    case 'badges':
      return matchBadges(product, condition.value as BadgesConditionValue)

    case 'metal_weight':
      return matchMetalWeight(variant, condition.value as MetalWeightConditionValue)

    case 'diamond_carat':
      return matchDiamondCarat(variant, condition.value as DiamondCaratConditionValue)

    case 'metal_type':
      return matchMetalType(variant, condition.value as MetalTypeConditionValue)

    case 'metal_color':
      return matchMetalColor(variant, condition.value as MetalColorConditionValue)

    case 'metal_purity':
      return matchMetalPurity(variant, condition.value as MetalPurityConditionValue)

    case 'diamond_clarity_color':
      return matchDiamondClarityColor(variant, condition.value as DiamondClarityColorConditionValue)

    case 'gemstone_carat':
      return matchGemstoneCarat(variant, condition.value as GemstoneCaratConditionValue)

    case 'pearl_gram':
      return matchPearlGram(variant, condition.value as PearlGramConditionValue)

    default:
      return false
  }
}

// Category: match by ID
function matchCategory(
  product: ProductForPricingPreview,
  value: CategoryConditionValue
): boolean {
  const productCategoryIds = product.categories.map(c => c.id)

  if (value.matchType === 'all') {
    // Product must have ALL specified categories
    return value.categoryIds.every(id => productCategoryIds.includes(id))
  } else {
    // Product must have ANY of the specified categories
    return value.categoryIds.some(id => productCategoryIds.includes(id))
  }
}

// Tags: match by ID
function matchTags(
  product: ProductForPricingPreview,
  value: TagsConditionValue
): boolean {
  const productTagIds = product.tags.map(t => t.id)

  if (value.matchType === 'all') {
    return value.tagIds.every(id => productTagIds.includes(id))
  } else {
    return value.tagIds.some(id => productTagIds.includes(id))
  }
}

// Badges: match by ID
function matchBadges(
  product: ProductForPricingPreview,
  value: BadgesConditionValue
): boolean {
  const productBadgeIds = product.badges.map(b => b.id)

  if (value.matchType === 'all') {
    return value.badgeIds.every(id => productBadgeIds.includes(id))
  } else {
    return value.badgeIds.some(id => productBadgeIds.includes(id))
  }
}

// Helper to safely get metadata value
function getMetadataValue<T>(metadata: Record<string, unknown>, key: string): T | undefined {
  return metadata?.[key] as T | undefined
}

// Helper to get nested weights value
function getWeightsValue(metadata: Record<string, unknown>, stoneType: string, property: string): number | undefined {
  const weights = metadata?.weights as Record<string, unknown> | undefined
  if (!weights) return undefined
  const stone = weights[stoneType] as Record<string, unknown> | undefined
  if (!stone) return undefined
  return stone[property] as number | undefined
}

// Metal Weight: range check (in grams)
function matchMetalWeight(
  variant: VariantForPricingPreview,
  value: MetalWeightConditionValue
): boolean {
  const weight = getMetadataValue<number>(variant.metadata, 'metalWeight')
  if (weight === undefined || weight === null) return false
  return weight >= value.from && weight <= value.to
}

// Diamond Carat: range check
function matchDiamondCarat(
  variant: VariantForPricingPreview,
  value: DiamondCaratConditionValue
): boolean {
  const carat = getWeightsValue(variant.metadata, 'diamond', 'carat')
  if (carat === undefined || carat === null) return false
  return carat >= value.from && carat <= value.to
}

// Metal Type: match by slug (any match)
// Note: The condition stores IDs, but variant metadata stores slugs
// We need to match using the slug which is stored in metalTypeIds
function matchMetalType(
  variant: VariantForPricingPreview,
  value: MetalTypeConditionValue
): boolean {
  const variantMetalType = getMetadataValue<string>(variant.metadata, 'metalType')
  if (!variantMetalType) return false
  // metalTypeIds contains slugs (from the dropdown which has id and name, but we store slug)
  return value.metalTypeIds.includes(variantMetalType)
}

// Metal Color: match by slug (any match)
function matchMetalColor(
  variant: VariantForPricingPreview,
  value: MetalColorConditionValue
): boolean {
  const variantMetalColor = getMetadataValue<string>(variant.metadata, 'metalColor')
  if (!variantMetalColor) return false
  return value.metalColorIds.includes(variantMetalColor)
}

// Metal Purity: match by slug (any match)
function matchMetalPurity(
  variant: VariantForPricingPreview,
  value: MetalPurityConditionValue
): boolean {
  const variantMetalPurity = getMetadataValue<string>(variant.metadata, 'metalPurity')
  if (!variantMetalPurity) return false
  return value.metalPurityIds.includes(variantMetalPurity)
}

// Diamond Clarity/Color: match by slug (any match)
function matchDiamondClarityColor(
  variant: VariantForPricingPreview,
  value: DiamondClarityColorConditionValue
): boolean {
  const variantDiamondClarityColor = getMetadataValue<string>(variant.metadata, 'diamondClarityColor')
  if (!variantDiamondClarityColor) return false
  return value.diamondClarityColorIds.includes(variantDiamondClarityColor)
}

// Gemstone Carat: range check
function matchGemstoneCarat(
  variant: VariantForPricingPreview,
  value: GemstoneCaratConditionValue
): boolean {
  const carat = getWeightsValue(variant.metadata, 'gemstone', 'carat')
  if (carat === undefined || carat === null) return false
  return carat >= value.from && carat <= value.to
}

// Pearl Gram: range check
function matchPearlGram(
  variant: VariantForPricingPreview,
  value: PearlGramConditionValue
): boolean {
  const grams = getWeightsValue(variant.metadata, 'pearl', 'grams')
  if (grams === undefined || grams === null) return false
  return grams >= value.from && grams <= value.to
}
