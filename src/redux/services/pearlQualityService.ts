import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Pearl Quality interface - matches backend response
export interface PearlQuality {
  id: string
  stone_group_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  image_alt_text: string | null
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Create Pearl Quality request
export interface CreatePearlQualityData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
}

// Update Pearl Quality request
export interface UpdatePearlQualityData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
}

// List response
interface PearlQualityListResponse {
  success: boolean
  message: string
  data: {
    items: PearlQuality[]
  }
}

// Single item response
interface PearlQualityResponse {
  success: boolean
  message: string
  data: PearlQuality
}

// Pearl Quality service with API calls
const pearlQualityService = {
  // List all pearl qualities
  list: async (): Promise<PearlQualityListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PEARL_QUALITY.LIST)
    return response.data
  },

  // Get single pearl quality by ID
  getById: async (id: string): Promise<PearlQualityResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PEARL_QUALITY.GET(id))
    return response.data
  },

  // Create pearl quality
  create: async (data: CreatePearlQualityData): Promise<PearlQualityResponse> => {
    const response = await apiService.post(API_ENDPOINTS.PEARL_QUALITY.CREATE, data)
    return response.data
  },

  // Update pearl quality
  update: async (id: string, data: UpdatePearlQualityData): Promise<PearlQualityResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PEARL_QUALITY.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.PEARL_QUALITY.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete pearl quality
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.PEARL_QUALITY.DELETE(id))
    return response.data
  },
}

export default pearlQualityService
