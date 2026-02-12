import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Size Chart Value interface - matches backend response
export interface SizeChartValue {
  id: string
  size_chart_group_id: string
  size_chart_group_name: string
  name: string
  description: string | null
  difference: number
  is_default: boolean
  created_at: string
  updated_at: string
}

// Dropdown item interface
export interface SizeChartGroupDropdownItem {
  id: string
  name: string
}

// Create Size Chart Value request - NO is_default
export interface CreateSizeChartValueData {
  size_chart_group_id: string
  name: string
  description?: string | null
  difference: number
}

// Update Size Chart Value request - NO is_default
export interface UpdateSizeChartValueData {
  name?: string
  description?: string | null
  difference?: number
}

// List response
interface SizeChartValueListResponse {
  success: boolean
  message: string
  data: {
    items: SizeChartValue[]
  }
}

// Single item response
interface SizeChartValueResponse {
  success: boolean
  message: string
  data: SizeChartValue
}

// Dropdown response
interface SizeChartGroupDropdownResponse {
  success: boolean
  message: string
  data: {
    items: SizeChartGroupDropdownItem[]
  }
}

// Delete response
interface DeleteResponse {
  success: boolean
  message: string
  data: null
}

// Size Chart Value service with API calls
const sizeChartValueService = {
  // List all size chart values with optional group filter
  list: async (groupId?: string): Promise<SizeChartValueListResponse> => {
    const url = groupId
      ? `${API_ENDPOINTS.SIZE_CHART_VALUE.LIST}?size_chart_group_id=${groupId}`
      : API_ENDPOINTS.SIZE_CHART_VALUE.LIST
    const response = await apiService.get(url)
    return response.data
  },

  // Get single size chart value by ID
  getById: async (id: string): Promise<SizeChartValueResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIZE_CHART_VALUE.GET(id))
    return response.data
  },

  // Create size chart value
  create: async (data: CreateSizeChartValueData): Promise<SizeChartValueResponse> => {
    const response = await apiService.post(API_ENDPOINTS.SIZE_CHART_VALUE.CREATE, data)
    return response.data
  },

  // Update size chart value
  update: async (id: string, data: UpdateSizeChartValueData): Promise<SizeChartValueResponse> => {
    const response = await apiService.put(API_ENDPOINTS.SIZE_CHART_VALUE.UPDATE(id), data)
    return response.data
  },

  // Make size chart value default
  makeDefault: async (id: string): Promise<SizeChartValueResponse> => {
    const response = await apiService.put(API_ENDPOINTS.SIZE_CHART_VALUE.MAKE_DEFAULT(id))
    return response.data
  },

  // Delete size chart value
  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.SIZE_CHART_VALUE.DELETE(id))
    return response.data
  },

  // Get size chart groups dropdown
  getGroupsDropdown: async (): Promise<SizeChartGroupDropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIZE_CHART_GROUP.DROPDOWN)
    return response.data
  },
}

export default sizeChartValueService
