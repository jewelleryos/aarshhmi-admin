import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Size Chart Group interface - matches backend response
export interface SizeChartGroup {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// Create Size Chart Group request - includes first value data
export interface CreateSizeChartGroupData {
  name: string
  value_name: string
  value_description?: string | null
  value_difference: number
}

// Update Size Chart Group request - only name can be changed
export interface UpdateSizeChartGroupData {
  name: string
}

// List response
interface SizeChartGroupListResponse {
  success: boolean
  message: string
  data: {
    items: SizeChartGroup[]
  }
}

// Single item response
interface SizeChartGroupResponse {
  success: boolean
  message: string
  data: SizeChartGroup
}

// Size Chart Group service with API calls
const sizeChartGroupService = {
  // List all size chart groups
  list: async (): Promise<SizeChartGroupListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIZE_CHART_GROUP.LIST)
    return response.data
  },

  // Get single size chart group by ID
  getById: async (id: string): Promise<SizeChartGroupResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIZE_CHART_GROUP.GET(id))
    return response.data
  },

  // Create size chart group with first value
  create: async (data: CreateSizeChartGroupData): Promise<SizeChartGroupResponse> => {
    const response = await apiService.post(API_ENDPOINTS.SIZE_CHART_GROUP.CREATE, data)
    return response.data
  },

  // Update size chart group (name only)
  update: async (id: string, data: UpdateSizeChartGroupData): Promise<SizeChartGroupResponse> => {
    const response = await apiService.put(API_ENDPOINTS.SIZE_CHART_GROUP.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.SIZE_CHART_GROUP.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete size chart group
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.SIZE_CHART_GROUP.DELETE(id))
    return response.data
  },
}

export default sizeChartGroupService
