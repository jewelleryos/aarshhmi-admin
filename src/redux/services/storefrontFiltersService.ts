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
}

export default storefrontFiltersService
