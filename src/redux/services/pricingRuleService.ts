import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Condition Types
export type ConditionType = 'category' | 'diamond_carat' | 'tags' | 'metal_weight' | 'badges' | 'metal_type' | 'metal_color' | 'metal_purity' | 'diamond_clarity_color' | 'gemstone_carat' | 'pearl_gram'

// Product Type
export type ProductType = 'JEWELLERY_DEFAULT'

// Category Condition Value
export interface CategoryConditionValue {
  matchType: 'any' | 'all'
  categoryIds: string[]
}

// Diamond Carat Condition Value
export interface DiamondCaratConditionValue {
  from: number
  to: number
}

// Tags Condition Value
export interface TagsConditionValue {
  matchType: 'any' | 'all'
  tagIds: string[]
}

// Metal Weight Condition Value
export interface MetalWeightConditionValue {
  from: number
  to: number
}

// Badges Condition Value
export interface BadgesConditionValue {
  matchType: 'any' | 'all'
  badgeIds: string[]
}

// Metal Type Condition Value (no matchType - always "any")
export interface MetalTypeConditionValue {
  metalTypeIds: string[]
}

// Metal Color Condition Value (no matchType - always "any")
export interface MetalColorConditionValue {
  metalColorIds: string[]
}

// Metal Purity Condition Value (no matchType - always "any")
export interface MetalPurityConditionValue {
  metalPurityIds: string[]
}

// Diamond Clarity Color Condition Value (no matchType - always "any")
export interface DiamondClarityColorConditionValue {
  diamondClarityColorIds: string[]
}

// Gemstone Carat Condition Value
export interface GemstoneCaratConditionValue {
  from: number
  to: number
}

// Pearl Gram Condition Value
export interface PearlGramConditionValue {
  from: number
  to: number
}

// Condition Value Union
export type ConditionValue = CategoryConditionValue | DiamondCaratConditionValue | TagsConditionValue | MetalWeightConditionValue | BadgesConditionValue | MetalTypeConditionValue | MetalColorConditionValue | MetalPurityConditionValue | DiamondClarityColorConditionValue | GemstoneCaratConditionValue | PearlGramConditionValue

// Single Condition
export interface PricingRuleCondition {
  type: ConditionType
  value: ConditionValue
}

// Actions (Markup Percentages)
export interface PricingRuleActions {
  diamondMarkup: number
  makingChargeMarkup: number
  gemstoneMarkup: number
  pearlMarkup: number
}

// Full Pricing Rule
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

// Create Input
export interface CreatePricingRuleData {
  name: string
  product_type?: ProductType
  conditions: PricingRuleCondition[]
  actions: PricingRuleActions
  is_active?: boolean
}

// Update Input
export interface UpdatePricingRuleData {
  name?: string
  product_type?: ProductType
  conditions?: PricingRuleCondition[]
  actions?: PricingRuleActions
  is_active?: boolean
}

// List Response
export interface PricingRuleListResponse {
  success: boolean
  message: string
  data: {
    items: PricingRule[]
  }
}

// Single Response
export interface PricingRuleResponse {
  success: boolean
  message: string
  data: PricingRule
}

// Delete Response
export interface DeleteResponse {
  success: boolean
  message: string
}

// Category Option for dropdown
export interface CategoryOption {
  id: string
  name: string
  parent_id: string | null
}

// Tag Option for dropdown
export interface TagOption {
  id: string
  tag_group_id: string
  name: string
}

// Badge Option for dropdown
export interface BadgeOption {
  id: string
  name: string
}

// Metal Type Option for dropdown
export interface MetalTypeOption {
  id: string
  name: string
}

// Metal Color Option for dropdown
export interface MetalColorOption {
  id: string
  name: string
}

// Metal Purity Option for dropdown
export interface MetalPurityOption {
  id: string
  name: string
}

// Diamond Clarity Color Option for dropdown
export interface DiamondClarityColorOption {
  id: string
  name: string
}

// Category List Response
export interface CategoryListResponse {
  success: boolean
  message: string
  data: {
    items: CategoryOption[]
  }
}

// Tag List Response
export interface TagListResponse {
  success: boolean
  message: string
  data: {
    items: TagOption[]
  }
}

// Badge List Response
export interface BadgeListResponse {
  success: boolean
  message: string
  data: {
    items: BadgeOption[]
  }
}

// Metal Type List Response
export interface MetalTypeListResponse {
  success: boolean
  message: string
  data: {
    items: MetalTypeOption[]
  }
}

// Metal Color List Response
export interface MetalColorListResponse {
  success: boolean
  message: string
  data: {
    items: MetalColorOption[]
  }
}

// Metal Purity List Response
export interface MetalPurityListResponse {
  success: boolean
  message: string
  data: {
    items: MetalPurityOption[]
  }
}

// Diamond Clarity Color List Response
export interface DiamondClarityColorListResponse {
  success: boolean
  message: string
  data: {
    items: DiamondClarityColorOption[]
  }
}

// Pricing Rule Service
const pricingRuleService = {
  // List all pricing rules
  list: async (): Promise<PricingRuleListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.LIST)
    return response.data
  },

  // Get single pricing rule
  getById: async (id: string): Promise<PricingRuleResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.GET(id))
    return response.data
  },

  // Create pricing rule
  create: async (data: CreatePricingRuleData): Promise<PricingRuleResponse> => {
    const response = await apiService.post(API_ENDPOINTS.PRICING_RULE.CREATE, data)
    return response.data
  },

  // Update pricing rule
  update: async (id: string, data: UpdatePricingRuleData): Promise<PricingRuleResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PRICING_RULE.UPDATE(id), data)
    return response.data
  },

  // Delete pricing rule
  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.PRICING_RULE.DELETE(id))
    return response.data
  },

  // Get categories for pricing rule dropdown
  getCategories: async (): Promise<CategoryListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.CATEGORIES)
    return response.data
  },

  // Get tags for pricing rule dropdown
  getTags: async (): Promise<TagListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.TAGS)
    return response.data
  },

  // Get badges for pricing rule dropdown
  getBadges: async (): Promise<BadgeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.BADGES)
    return response.data
  },

  // Get metal types for pricing rule dropdown
  getMetalTypes: async (): Promise<MetalTypeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.METAL_TYPES)
    return response.data
  },

  // Get metal colors for pricing rule dropdown
  getMetalColors: async (): Promise<MetalColorListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.METAL_COLORS)
    return response.data
  },

  // Get metal purities for pricing rule dropdown
  getMetalPurities: async (): Promise<MetalPurityListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.METAL_PURITIES)
    return response.data
  },

  // Get diamond clarity colors for pricing rule dropdown
  getDiamondClarityColors: async (): Promise<DiamondClarityColorListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICING_RULE.DIAMOND_CLARITY_COLORS)
    return response.data
  },
}

export default pricingRuleService
