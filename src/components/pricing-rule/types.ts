// Pricing Rule Types - Matches backend types

// Product types available for pricing rules
export const PRODUCT_TYPES = [
  { code: 'JEWELLERY_DEFAULT', name: 'Jewellery (Default)' },
] as const

export type ProductType = 'JEWELLERY_DEFAULT'

// Condition types
export type ConditionType = 'category' | 'diamond_carat' | 'tags' | 'metal_weight' | 'badges' | 'metal_type' | 'metal_color' | 'metal_purity' | 'diamond_clarity_color' | 'gemstone_carat' | 'pearl_gram'

// Condition match type for multi-select conditions
export type ConditionMatchType = 'all' | 'any'

// Condition configuration - defines which product types each condition is allowed for
export const CONDITION_CONFIG: Record<ConditionType, {
  label: string
  description: string
  allowedProductTypes: ProductType[]
}> = {
  category: {
    label: 'Category',
    description: 'Match products by category',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  diamond_carat: {
    label: 'Diamond Total Carat',
    description: 'Match products by total diamond carat range',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  tags: {
    label: 'Tags',
    description: 'Match products by tags',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  metal_weight: {
    label: 'Metal Weight (grams)',
    description: 'Match products by metal weight range',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  badges: {
    label: 'Badges',
    description: 'Match products by badges',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  metal_type: {
    label: 'Metal Type',
    description: 'Match products by metal type',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  metal_color: {
    label: 'Metal Color',
    description: 'Match products by metal color',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  metal_purity: {
    label: 'Metal Purity',
    description: 'Match products by metal purity',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  diamond_clarity_color: {
    label: 'Diamond Clarity/Color',
    description: 'Match products by diamond clarity/color grade',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  gemstone_carat: {
    label: 'Gemstone Total Carat',
    description: 'Match products by total gemstone carat range',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
  pearl_gram: {
    label: 'Pearl Total Gram',
    description: 'Match products by total pearl gram range',
    allowedProductTypes: ['JEWELLERY_DEFAULT'],
  },
}

// Category condition value
export interface CategoryConditionValue {
  matchType: ConditionMatchType
  categoryIds: string[]
}

// Diamond carat condition value
export interface DiamondCaratConditionValue {
  from: number
  to: number
}

// Tags condition value
export interface TagsConditionValue {
  matchType: ConditionMatchType
  tagIds: string[]
}

// Metal weight condition value
export interface MetalWeightConditionValue {
  from: number
  to: number
}

// Badges condition value
export interface BadgesConditionValue {
  matchType: ConditionMatchType
  badgeIds: string[]
}

// Metal type condition value (no matchType - always "any")
export interface MetalTypeConditionValue {
  metalTypeIds: string[]
}

// Metal color condition value (no matchType - always "any")
export interface MetalColorConditionValue {
  metalColorIds: string[]
}

// Metal purity condition value (no matchType - always "any")
export interface MetalPurityConditionValue {
  metalPurityIds: string[]
}

// Diamond clarity color condition value (no matchType - always "any")
export interface DiamondClarityColorConditionValue {
  diamondClarityColorIds: string[]
}

// Gemstone carat condition value
export interface GemstoneCaratConditionValue {
  from: number
  to: number
}

// Pearl gram condition value
export interface PearlGramConditionValue {
  from: number
  to: number
}

// Union type for condition values
export type ConditionValue = CategoryConditionValue | DiamondCaratConditionValue | TagsConditionValue | MetalWeightConditionValue | BadgesConditionValue | MetalTypeConditionValue | MetalColorConditionValue | MetalPurityConditionValue | DiamondClarityColorConditionValue | GemstoneCaratConditionValue | PearlGramConditionValue

// Condition interface (from API - no id field)
export interface PricingRuleCondition {
  type: ConditionType
  value: ConditionValue
}

// Actions - markup percentages for different price components
export interface PricingRuleActions {
  diamondMarkup: number
  makingChargeMarkup: number
  gemstoneMarkup: number
  pearlMarkup: number
}

// Pricing Rule interface (from API)
export interface PricingRule {
  id: string
  name: string
  product_type: ProductType
  conditions: PricingRuleCondition[]
  actions: PricingRuleActions
  is_active: boolean
  created_at: string
  updated_at: string
}

// Create request
export interface CreatePricingRuleData {
  name: string
  product_type?: ProductType
  conditions: PricingRuleCondition[]
  actions: PricingRuleActions
  is_active?: boolean
}

// Update request
export interface UpdatePricingRuleData {
  name?: string
  product_type?: ProductType
  conditions?: PricingRuleCondition[]
  actions?: PricingRuleActions
  is_active?: boolean
}

// Category for dropdown (simplified)
export interface CategoryOption {
  id: string
  name: string
  parent_id: string | null
}

// Tag for dropdown
export interface TagOption {
  id: string
  tag_group_id: string
  name: string
}

// Badge for dropdown
export interface BadgeOption {
  id: string
  name: string
}

// Metal type for dropdown
export interface MetalTypeOption {
  id: string
  name: string
}

// Metal color for dropdown
export interface MetalColorOption {
  id: string
  name: string
}

// Metal purity for dropdown
export interface MetalPurityOption {
  id: string
  name: string
}

// Diamond clarity color for dropdown
export interface DiamondClarityColorOption {
  id: string
  name: string
}

// Condition state for form (includes id for UI tracking)
export interface ConditionState {
  id: string
  type: ConditionType | null
  value: CategoryConditionValue | DiamondCaratConditionValue | TagsConditionValue | MetalWeightConditionValue | BadgesConditionValue | MetalTypeConditionValue | MetalColorConditionValue | MetalPurityConditionValue | DiamondClarityColorConditionValue | GemstoneCaratConditionValue | PearlGramConditionValue | null
}

// Helper to generate unique IDs
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// Types for Applicable Products Preview
// ============================================

// Variant metadata structure (from variant.metadata)
export interface VariantMetadata {
  metalType: string        // Slug (e.g., "gold")
  metalColor: string       // Slug (e.g., "yellow")
  metalPurity: string      // Slug (e.g., "18k")
  metalWeight: number      // Grams
  diamondClarityColor?: string  // Slug (e.g., "vs1-g")
  gemstoneColor?: string   // Slug
  weights?: {
    metal?: { grams: number }
    diamond?: { carat: number; grams?: number }
    gemstone?: { carat: number; grams?: number }
    pearl?: { grams?: number }
    total?: { grams: number }
  }
}

// Cost price components from price_components.costPrice
export interface VariantCostPrice {
  metalPrice: number       // In paise
  makingCharge: number     // In paise
  diamondPrice: number     // In paise
  gemstonePrice: number    // In paise
  pearlPrice: number       // In paise
  finalPriceWithoutTax: number
  taxAmount: number
  finalPriceWithTax: number
  finalPrice: number
  taxIncluded: boolean
}

// Variant for pricing preview
// Uses Record<string, unknown> for price_components and metadata because
// the API returns these as generic JSONB objects. The actual extraction
// and type checking is done in the pricing-rule-calculator utility.
export interface VariantForPricingPreview {
  id: string
  sku: string
  variant_name: string | null
  price: number              // Current selling price in paise
  price_components: Record<string, unknown>
  metadata: Record<string, unknown>
}

// Media item structure (from product metadata)
export interface MediaItem {
  id: string
  path: string
  type: string
  altText: string | null
  position: number
}

// Gemstone sub-media
export interface GemstoneSubMedia {
  gemstoneColorId: string
  items: MediaItem[]
}

// Color media (images grouped by metal color)
export interface ColorMedia {
  metalColorId: string
  items: MediaItem[]
  gemstoneSubMedia: GemstoneSubMedia[]
}

// Product metadata structure (contains media)
export interface ProductMetadata {
  media?: {
    colorMedia: ColorMedia[]
  }
  [key: string]: unknown
}

// Product for pricing preview (lightweight version for matching)
export interface ProductForPricingPreview {
  id: string
  name: string
  base_sku: string
  metadata: ProductMetadata
  categories: { id: string }[]
  tags: { id: string }[]
  badges: { id: string }[]
  variants: VariantForPricingPreview[]
}

// Result item for applicable products table
export interface ApplicableProductResult {
  productId: string
  productName: string
  productSku: string
  variantId: string
  variantSku: string
  variantName: string | null
  currentSellingPrice: number  // In paise
  newSellingPrice: number      // In paise
  priceDifference: number      // In paise (new - current)
  priceDifferencePercent: number
}
