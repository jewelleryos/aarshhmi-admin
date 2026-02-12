import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Size Chart Group dropdown item
export interface SizeChartGroupDropdownItem {
  id: string
  name: string
}

// Metal Type dropdown item
export interface MetalTypeDropdownItem {
  id: string
  name: string
  slug: string
}

// Metal Color dropdown item
export interface MetalColorDropdownItem {
  id: string
  metal_type_id: string
  name: string
  slug: string
}

// Metal Purity dropdown item (includes price and slug for calculation)
export interface MetalPurityDropdownItem {
  id: string
  metal_type_id: string
  name: string
  slug: string
  price: number  // Price in smallest unit (paise)
}

// Stone Shape dropdown item
export interface StoneShapeDropdownItem {
  id: string
  name: string
  slug: string
}

// Diamond Clarity Color dropdown item
export interface DiamondClarityColorDropdownItem {
  id: string
  name: string
  slug: string
}

// Diamond Pricing dropdown item (for price calculation)
export interface DiamondPricingDropdownItem {
  id: string
  stone_shape_id: string
  stone_quality_id: string  // This is clarity/color id
  ct_from: number
  ct_to: number
  price: number  // Price in smallest unit (paise)
}

// Gemstone Type dropdown item
export interface GemstoneTypeDropdownItem {
  id: string
  name: string
  slug: string
}

// Gemstone Quality dropdown item
export interface GemstoneQualityDropdownItem {
  id: string
  name: string
  slug: string
}

// Gemstone Color dropdown item
export interface GemstoneColorDropdownItem {
  id: string
  name: string
  slug: string
}

// Gemstone Pricing dropdown item (for price calculation)
export interface GemstonePricingDropdownItem {
  id: string
  stone_type_id: string
  stone_shape_id: string
  stone_quality_id: string
  stone_color_id: string
  ct_from: number
  ct_to: number
  price: number  // Price in smallest unit (paise)
}

// Pearl Type dropdown item
export interface PearlTypeDropdownItem {
  id: string
  name: string
  slug: string
}

// Pearl Quality dropdown item
export interface PearlQualityDropdownItem {
  id: string
  name: string
  slug: string
}

// Badge dropdown item for product
export interface BadgeDropdownItem {
  id: string
  name: string
}

// Category dropdown item for product
export interface CategoryDropdownItem {
  id: string
  name: string
  parent_id: string | null
}

// Tag Group dropdown item for product
export interface TagGroupDropdownItem {
  id: string
  name: string
}

// Tag dropdown item for product
export interface TagDropdownItem {
  id: string
  tag_group_id: string
  name: string
}

// Product list item for table display
export interface ProductListItem {
  id: string
  name: string
  base_sku: string
  status: 'draft' | 'active' | 'archived'
  min_price: number
  max_price: number
  variant_count: number
  primary_category: {
    id: string
    name: string
  } | null
  created_at: string
}

// Product list response
interface ProductListResponse {
  success: boolean
  message: string
  data: {
    items: ProductListItem[]
    total: number
  }
}

// Product detail types
export interface ProductOptionValue {
  id: string
  value: string
  rank: number
}

export interface ProductOption {
  id: string
  name: string
  rank: number
  values: ProductOptionValue[]
}

export interface VariantOptionValue {
  option_name: string
  option_value_id: string
  value: string
}

export interface ProductVariant {
  id: string
  sku: string
  variant_name: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  price_components: Record<string, unknown>
  is_default: boolean
  is_available: boolean
  stock_quantity: number | null
  metadata: Record<string, unknown>
  option_values: VariantOptionValue[]
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  is_primary: boolean
}

export interface ProductTag {
  id: string
  name: string
  slug: string
  tag_group_id: string
  tag_group_name: string
}

export interface ProductBadge {
  id: string
  name: string
  slug: string
  bg_color: string
  font_color: string
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  short_description: string | null
  description: string | null
  product_type: string
  base_sku: string
  style_sku: string | null
  status: 'draft' | 'active' | 'archived'
  min_price: number
  max_price: number
  variant_count: number
  default_variant_id: string | null
  seo: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  options: ProductOption[]
  variants: ProductVariant[]
  categories: ProductCategory[]
  tags: ProductTag[]
  badges: ProductBadge[]
}

// Product detail response
interface ProductDetailResponse {
  success: boolean
  message: string
  data: ProductDetail
}

// Generic response type for dropdowns
interface DropdownResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
  }
}

// Create product response
interface CreateProductResponse {
  success: boolean
  message: string
  data: unknown
}

// Update basic details request
export interface UpdateBasicDetailsRequest {
  title: string
  slug: string
  productSku: string
  styleSku?: string | null
  shortDescription?: string | null
  description?: string | null
  dimensions: {
    width: number
    height: number
    length: number
  }
  engraving: {
    hasEngraving: boolean
    maxChars?: number | null
  }
  sizeChart: {
    hasSizeChart: boolean
    sizeChartGroupId?: string | null
  }
}

// Update basic details response
interface UpdateBasicDetailsResponse {
  success: boolean
  message: string
  data: {
    id: string
    title: string
    slug: string
    productSku: string
    styleSku: string | null
    updatedAt: string
  }
}

// Update attributes request
export interface UpdateAttributesRequest {
  categories: {
    categoryId: string
    isPrimary: boolean
  }[]
  tagIds: string[]
  badgeIds: string[]
}

// Update attributes response
interface UpdateAttributesResponse {
  success: boolean
  message: string
  data: {
    id: string
    categoriesCount: number
    tagsCount: number
    badgesCount: number
  }
}

// Update SEO request
export interface UpdateSeoRequest {
  meta_title?: string | null
  meta_keywords?: string | null
  meta_description?: string | null
  meta_robots?: string | null
  meta_canonical?: string | null
  og_title?: string | null
  og_site_name?: string | null
  og_description?: string | null
  og_url?: string | null
  og_image_url?: string | null
  twitter_card_title?: string | null
  twitter_card_site_name?: string | null
  twitter_card_description?: string | null
  twitter_url?: string | null
  twitter_media?: string | null
}

// Update SEO response
interface UpdateSeoResponse {
  success: boolean
  message: string
  data: {
    id: string
    seo: Record<string, unknown>
  }
}

// Update media types
export interface MediaItem {
  id: string
  path: string
  type: string
  altText: string | null
  position: number
}

export interface GemstoneSubMedia {
  gemstoneColorId: string
  items: MediaItem[]
}

export interface ColorMedia {
  metalColorId: string
  items: MediaItem[]
  gemstoneSubMedia: GemstoneSubMedia[]
}

export interface UpdateMediaRequest {
  colorMedia: ColorMedia[]
}

// Update media response
interface UpdateMediaResponse {
  success: boolean
  message: string
  data: {
    id: string
    updated_at: string
  }
}

// Update options request type
export interface UpdateOptionsRequest {
  metal: {
    selectedMetals: {
      metalTypeId: string
      colors: { colorId: string }[]
      purities: { purityId: string; weight: number }[]
    }[]
  }
  stone: {
    hasDiamond: boolean
    diamond: {
      clarityColors: { id: string }[]
      entries: {
        shapeId: string
        totalCarat: number
        noOfStones: number
        pricings: { clarityColorId: string; pricingId: string }[]
      }[]
    } | null
    hasGemstone: boolean
    gemstone: {
      qualityId: string
      colors: { id: string }[]
      entries: {
        typeId: string
        shapeId: string
        totalCarat: number
        noOfStones: number
        pricings: { colorId: string; pricingId: string }[]
      }[]
    } | null
    hasPearl: boolean
    pearl: {
      entries: {
        typeId: string
        qualityId: string
        noOfPearls: number
        totalGrams: number
        amount: number
      }[]
    } | null
  }
  variants: {
    defaultVariantId: string
    generatedVariants: {
      id: string
      metalType: { id: string }
      metalColor: { id: string }
      metalPurity: { id: string; weight: number }
      diamondClarityColor: { id: string } | null
      gemstoneColor: { id: string } | null
      isDefault: boolean
    }[]
  }
  media: {
    colorMedia: ColorMedia[]
  }
}

// Update options response
interface UpdateOptionsResponse {
  success: boolean
  message: string
  data: {
    id: string
    variantCount: number
    minPrice: number
    maxPrice: number
  }
}

// Import ProductForPricingPreview from pricing-rule types
import type { ProductForPricingPreview } from '@/components/pricing-rule/types'

// Re-export for convenience
export type { ProductForPricingPreview }

// Response for pricing preview products
interface PricingPreviewProductsResponse {
  success: boolean
  message: string
  data: ProductForPricingPreview[]
}

// Update product status types
export interface UpdateStatusRequest {
  status: 'draft' | 'inactive' | 'active' | 'archived'
}

interface UpdateStatusResponse {
  success: boolean
  message: string
  data: {
    id: string
    status: string
  }
}

// Update variant stock types
export interface UpdateVariantStockRequest {
  stock_quantity: number
}

interface UpdateVariantStockResponse {
  success: boolean
  message: string
  data: {
    id: string
    stock_quantity: number
  }
}

// Product service with API calls
const productService = {
  // Get all products for listing
  getList: async (): Promise<ProductListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.LIST)
    return response.data
  },

  // Get all products for pricing rule preview
  // Uses dedicated endpoint that returns optimized data in single call
  getAllForPricingPreview: async (): Promise<PricingPreviewProductsResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.FOR_PRICING_RULE)
    return response.data
  },

  // Get product by ID
  getById: async (id: string): Promise<ProductDetailResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GET(id))
    return response.data
  },

  // Create product
  create: async (data: unknown): Promise<CreateProductResponse> => {
    const response = await apiService.post(API_ENDPOINTS.PRODUCT.CREATE, data)
    return response.data
  },

  // Get size chart groups for product dropdown (create)
  getSizeChartGroups: async (): Promise<DropdownResponse<SizeChartGroupDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.SIZE_CHART_GROUPS)
    return response.data
  },

  // Get size chart groups for product edit dropdown
  getSizeChartGroupsForEdit: async (): Promise<DropdownResponse<SizeChartGroupDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.SIZE_CHART_GROUPS_FOR_EDIT)
    return response.data
  },

  // Update product basic details
  updateBasicDetails: async (id: string, data: UpdateBasicDetailsRequest): Promise<UpdateBasicDetailsResponse> => {
    const response = await apiService.patch(API_ENDPOINTS.PRODUCT.UPDATE_BASIC(id), data)
    return response.data
  },

  // Get metal types for product dropdown
  getMetalTypes: async (): Promise<DropdownResponse<MetalTypeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.METAL_TYPES)
    return response.data
  },

  // Get metal colors for product dropdown
  getMetalColors: async (): Promise<DropdownResponse<MetalColorDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.METAL_COLORS)
    return response.data
  },

  // Get metal purities for product dropdown
  getMetalPurities: async (): Promise<DropdownResponse<MetalPurityDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.METAL_PURITIES)
    return response.data
  },

  // Get stone shapes for product dropdown
  getStoneShapes: async (): Promise<DropdownResponse<StoneShapeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.STONE_SHAPES)
    return response.data
  },

  // Get diamond clarity colors for product dropdown
  getDiamondClarityColors: async (): Promise<DropdownResponse<DiamondClarityColorDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.DIAMOND_CLARITY_COLORS)
    return response.data
  },

  // Get diamond pricings for product dropdown
  getDiamondPricings: async (): Promise<DropdownResponse<DiamondPricingDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.DIAMOND_PRICINGS)
    return response.data
  },

  // Get gemstone types for product dropdown
  getGemstoneTypes: async (): Promise<DropdownResponse<GemstoneTypeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_TYPES)
    return response.data
  },

  // Get gemstone qualities for product dropdown
  getGemstoneQualities: async (): Promise<DropdownResponse<GemstoneQualityDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_QUALITIES)
    return response.data
  },

  // Get gemstone colors for product dropdown
  getGemstoneColors: async (): Promise<DropdownResponse<GemstoneColorDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_COLORS)
    return response.data
  },

  // Get gemstone pricings for product dropdown
  getGemstonePricings: async (): Promise<DropdownResponse<GemstonePricingDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_PRICINGS)
    return response.data
  },

  // Get pearl types for product dropdown
  getPearlTypes: async (): Promise<DropdownResponse<PearlTypeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.PEARL_TYPES)
    return response.data
  },

  // Get pearl qualities for product dropdown
  getPearlQualities: async (): Promise<DropdownResponse<PearlQualityDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.PEARL_QUALITIES)
    return response.data
  },

  // Get badges for product dropdown
  getBadges: async (): Promise<DropdownResponse<BadgeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.BADGES)
    return response.data
  },

  // Get categories for product dropdown
  getCategories: async (): Promise<DropdownResponse<CategoryDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.CATEGORIES)
    return response.data
  },

  // Get tag groups for product dropdown
  getTagGroups: async (): Promise<DropdownResponse<TagGroupDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.TAG_GROUPS)
    return response.data
  },

  // Get tags for product dropdown
  getTags: async (): Promise<DropdownResponse<TagDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.TAGS)
    return response.data
  },

  // Get badges for product edit dropdown
  getBadgesForEdit: async (): Promise<DropdownResponse<BadgeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.BADGES_FOR_EDIT)
    return response.data
  },

  // Get categories for product edit dropdown
  getCategoriesForEdit: async (): Promise<DropdownResponse<CategoryDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.CATEGORIES_FOR_EDIT)
    return response.data
  },

  // Get tag groups for product edit dropdown
  getTagGroupsForEdit: async (): Promise<DropdownResponse<TagGroupDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.TAG_GROUPS_FOR_EDIT)
    return response.data
  },

  // Get tags for product edit dropdown
  getTagsForEdit: async (): Promise<DropdownResponse<TagDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.TAGS_FOR_EDIT)
    return response.data
  },

  // Options dropdowns for product edit (uses PRODUCT.UPDATE permission)
  getMetalTypesForEdit: async (): Promise<DropdownResponse<MetalTypeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.METAL_TYPES_FOR_EDIT)
    return response.data
  },

  getMetalColorsForEdit: async (): Promise<DropdownResponse<MetalColorDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.METAL_COLORS_FOR_EDIT)
    return response.data
  },

  getMetalPuritiesForEdit: async (): Promise<DropdownResponse<MetalPurityDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.METAL_PURITIES_FOR_EDIT)
    return response.data
  },

  getStoneShapesForEdit: async (): Promise<DropdownResponse<StoneShapeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.STONE_SHAPES_FOR_EDIT)
    return response.data
  },

  getDiamondClarityColorsForEdit: async (): Promise<DropdownResponse<DiamondClarityColorDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.DIAMOND_CLARITY_COLORS_FOR_EDIT)
    return response.data
  },

  getDiamondPricingsForEdit: async (): Promise<DropdownResponse<DiamondPricingDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.DIAMOND_PRICINGS_FOR_EDIT)
    return response.data
  },

  getGemstoneTypesForEdit: async (): Promise<DropdownResponse<GemstoneTypeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_TYPES_FOR_EDIT)
    return response.data
  },

  getGemstoneQualitiesForEdit: async (): Promise<DropdownResponse<GemstoneQualityDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_QUALITIES_FOR_EDIT)
    return response.data
  },

  getGemstoneColorsForEdit: async (): Promise<DropdownResponse<GemstoneColorDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_COLORS_FOR_EDIT)
    return response.data
  },

  getGemstonePricingsForEdit: async (): Promise<DropdownResponse<GemstonePricingDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.GEMSTONE_PRICINGS_FOR_EDIT)
    return response.data
  },

  getPearlTypesForEdit: async (): Promise<DropdownResponse<PearlTypeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.PEARL_TYPES_FOR_EDIT)
    return response.data
  },

  getPearlQualitiesForEdit: async (): Promise<DropdownResponse<PearlQualityDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.PEARL_QUALITIES_FOR_EDIT)
    return response.data
  },

  // Update product attributes
  updateAttributes: async (id: string, data: UpdateAttributesRequest): Promise<UpdateAttributesResponse> => {
    const response = await apiService.patch(API_ENDPOINTS.PRODUCT.UPDATE_ATTRIBUTES(id), data)
    return response.data
  },

  // Update product SEO
  updateSeo: async (id: string, data: UpdateSeoRequest): Promise<UpdateSeoResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PRODUCT.UPDATE_SEO(id), data)
    return response.data
  },

  // Update product media
  updateMedia: async (id: string, data: UpdateMediaRequest): Promise<UpdateMediaResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PRODUCT.UPDATE_MEDIA(id), data)
    return response.data
  },

  // Update product options (metal, stone, variants, media)
  updateOptions: async (id: string, data: UpdateOptionsRequest): Promise<UpdateOptionsResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PRODUCT.UPDATE_OPTIONS(id), data)
    return response.data
  },

  // Update product status
  updateStatus: async (id: string, data: UpdateStatusRequest): Promise<UpdateStatusResponse> => {
    const response = await apiService.patch(API_ENDPOINTS.PRODUCT.UPDATE_STATUS(id), data)
    return response.data
  },

  // Update variant stock
  updateVariantStock: async (
    productId: string,
    variantId: string,
    data: UpdateVariantStockRequest
  ): Promise<UpdateVariantStockResponse> => {
    const response = await apiService.patch(
      API_ENDPOINTS.PRODUCT.UPDATE_VARIANT_STOCK(productId, variantId),
      data
    )
    return response.data
  },
}

export default productService
