import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Gemstone Type interface - matches backend response
export interface GemstoneType {
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

// Create Gemstone Type request
export interface CreateGemstoneTypeData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Gemstone Type request
export interface UpdateGemstoneTypeData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
}

// List response
interface GemstoneTypeListResponse {
  success: boolean
  message: string
  data: {
    items: GemstoneType[]
  }
}

// Single item response
interface GemstoneTypeResponse {
  success: boolean
  message: string
  data: GemstoneType
}

// Gemstone Type service with API calls
const gemstoneTypeService = {
  // List all gemstone types
  list: async (): Promise<GemstoneTypeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_TYPE.LIST)
    return response.data
  },

  // Get single gemstone type by ID
  getById: async (id: string): Promise<GemstoneTypeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_TYPE.GET(id))
    return response.data
  },

  // Create gemstone type
  create: async (data: CreateGemstoneTypeData): Promise<GemstoneTypeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.GEMSTONE_TYPE.CREATE, data)
    return response.data
  },

  // Update gemstone type
  update: async (id: string, data: UpdateGemstoneTypeData): Promise<GemstoneTypeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.GEMSTONE_TYPE.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_TYPE.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete gemstone type
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.GEMSTONE_TYPE.DELETE(id))
    return response.data
  },
}

export default gemstoneTypeService
