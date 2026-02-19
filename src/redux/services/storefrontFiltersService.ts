import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Filter value (tag) for storefront filters
export interface FilterValue {
  id: string
  name: string
  slug: string
  display_name: string | null
  media_url: string | null
  media_alt_text: string | null
  is_filterable: boolean
  rank: number
  is_system_generated: boolean
}

// Filter group (tag group) with its values
export interface FilterGroup {
  id: string
  name: string
  slug: string
  display_name: string | null
  media_url: string | null
  media_alt_text: string | null
  is_filterable: boolean
  rank: number
  is_system_generated: boolean
  values: FilterValue[]
}

// Update filter group request
export interface UpdateFilterGroupData {
  filter_display_name?: string | null
  media_url?: string | null
  media_alt_text?: string | null
  is_filterable?: boolean
  rank?: number
}

// Update filter value request
export interface UpdateFilterValueData {
  filter_display_name?: string | null
  media_url?: string | null
  media_alt_text?: string | null
  is_filterable?: boolean
  rank?: number
}

// List response
interface FilterListResponse {
  success: boolean
  message: string
  data: FilterGroup[]
}

// Update response
interface UpdateResponse {
  success: boolean
  message: string
  data: { id: string }
}

// Price filter range entity
export interface PriceFilterRange {
  id: string
  display_name: string
  min_price: number
  max_price: number
  media_url: string | null
  media_alt_text: string | null
  rank: number
  status: boolean
  created_at: string
  updated_at: string
}

// Create price filter range request
export interface CreatePriceFilterRangeData {
  display_name: string
  min_price: number
  max_price: number
  media_url?: string | null
  media_alt_text?: string | null
  rank?: number
  status?: boolean
}

// Update price filter range request
export interface UpdatePriceFilterRangeData {
  display_name?: string
  min_price?: number
  max_price?: number
  media_url?: string | null
  media_alt_text?: string | null
  rank?: number
  status?: boolean
}

// Price filter range list response
interface PriceFilterRangeListResponse {
  success: boolean
  message: string
  data: { items: PriceFilterRange[] }
}

// Price filter range single response
interface PriceFilterRangeResponse {
  success: boolean
  message: string
  data: PriceFilterRange
}

// Price filter range delete response
interface PriceFilterRangeDeleteResponse {
  success: boolean
  message: string
  data: { id: string }
}

// Sort-by option entity
export interface SortByOption {
  id: string
  key: string
  label: string
  sort_column: string
  sort_direction: string
  tiebreaker_column: string | null
  tiebreaker_direction: string | null
  is_active: boolean
  rank: number
  created_at: string
  updated_at: string
}

// Update sort-by option request
export interface UpdateSortByOptionData {
  label?: string
  is_active?: boolean
  rank?: number
}

// Sort-by option list response
interface SortByOptionListResponse {
  success: boolean
  message: string
  data: { items: SortByOption[] }
}

// Sort-by option update response
interface SortByOptionUpdateResponse {
  success: boolean
  message: string
  data: SortByOption
}

// Group config entity
export interface StorefrontFilterGroupConfig {
  id: string
  type: string
  display_name: string | null
  is_filterable: boolean
  rank: number
  created_at: string
  updated_at: string
}

// Update group config request
export interface UpdateGroupConfigData {
  display_name?: string | null
  is_filterable?: boolean
  rank?: number
}

// Group config list response
interface GroupConfigListResponse {
  success: boolean
  message: string
  data: { items: StorefrontFilterGroupConfig[] }
}

// Group config update response
interface GroupConfigUpdateResponse {
  success: boolean
  message: string
  data: StorefrontFilterGroupConfig
}

// Storefront filters service with API calls
const storefrontFiltersService = {
  // List all filters (tag groups with their values)
  list: async (): Promise<FilterListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STOREFRONT_FILTERS.LIST)
    return response.data
  },

  // Update filter group settings
  updateGroup: async (id: string, data: UpdateFilterGroupData): Promise<UpdateResponse> => {
    const response = await apiService.put(
      API_ENDPOINTS.STOREFRONT_FILTERS.UPDATE_GROUP(id),
      data
    )
    return response.data
  },

  // Update filter value settings
  updateValue: async (
    groupId: string,
    valueId: string,
    data: UpdateFilterValueData
  ): Promise<UpdateResponse> => {
    const response = await apiService.put(
      API_ENDPOINTS.STOREFRONT_FILTERS.UPDATE_VALUE(groupId, valueId),
      data
    )
    return response.data
  },

  // Price filter range CRUD
  listPriceRanges: async (): Promise<PriceFilterRangeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STOREFRONT_FILTERS.PRICE_RANGES_LIST)
    return response.data
  },

  createPriceRange: async (data: CreatePriceFilterRangeData): Promise<PriceFilterRangeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.STOREFRONT_FILTERS.PRICE_RANGE_CREATE, data)
    return response.data
  },

  updatePriceRange: async (id: string, data: UpdatePriceFilterRangeData): Promise<PriceFilterRangeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.STOREFRONT_FILTERS.PRICE_RANGE_UPDATE(id), data)
    return response.data
  },

  deletePriceRange: async (id: string): Promise<PriceFilterRangeDeleteResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.STOREFRONT_FILTERS.PRICE_RANGE_DELETE(id))
    return response.data
  },

  // Sort-by options
  listSortByOptions: async (): Promise<SortByOptionListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STOREFRONT_FILTERS.SORT_BY_OPTIONS_LIST)
    return response.data
  },

  updateSortByOption: async (id: string, data: UpdateSortByOptionData): Promise<SortByOptionUpdateResponse> => {
    const response = await apiService.put(API_ENDPOINTS.STOREFRONT_FILTERS.SORT_BY_OPTION_UPDATE(id), data)
    return response.data
  },

  // Group config
  listGroupConfigs: async (): Promise<GroupConfigListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STOREFRONT_FILTERS.GROUP_CONFIG_LIST)
    return response.data
  },

  updateGroupConfig: async (id: string, data: UpdateGroupConfigData): Promise<GroupConfigUpdateResponse> => {
    const response = await apiService.put(API_ENDPOINTS.STOREFRONT_FILTERS.GROUP_CONFIG_UPDATE(id), data)
    return response.data
  },
}

export default storefrontFiltersService
