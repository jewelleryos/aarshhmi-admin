import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Gemstone Quality interface - matches backend response
export interface GemstoneQuality {
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

// Create Gemstone Quality request
export interface CreateGemstoneQualityData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Gemstone Quality request
export interface UpdateGemstoneQualityData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
}

// List response
interface GemstoneQualityListResponse {
  success: boolean
  message: string
  data: {
    items: GemstoneQuality[]
  }
}

// Single item response
interface GemstoneQualityResponse {
  success: boolean
  message: string
  data: GemstoneQuality
}

// Gemstone Quality service with API calls
const gemstoneQualityService = {
  // List all gemstone qualities
  list: async (): Promise<GemstoneQualityListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_QUALITY.LIST)
    return response.data
  },

  // Get single gemstone quality by ID
  getById: async (id: string): Promise<GemstoneQualityResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_QUALITY.GET(id))
    return response.data
  },

  // Create gemstone quality
  create: async (data: CreateGemstoneQualityData): Promise<GemstoneQualityResponse> => {
    const response = await apiService.post(API_ENDPOINTS.GEMSTONE_QUALITY.CREATE, data)
    return response.data
  },

  // Update gemstone quality
  update: async (id: string, data: UpdateGemstoneQualityData): Promise<GemstoneQualityResponse> => {
    const response = await apiService.put(API_ENDPOINTS.GEMSTONE_QUALITY.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_QUALITY.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete gemstone quality
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.GEMSTONE_QUALITY.DELETE(id))
    return response.data
  },
}

export default gemstoneQualityService
