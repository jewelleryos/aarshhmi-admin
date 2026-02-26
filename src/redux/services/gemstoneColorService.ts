import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Gemstone Color interface - matches backend response
export interface GemstoneColor {
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

// Create Gemstone Color request
export interface CreateGemstoneColorData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Gemstone Color request
export interface UpdateGemstoneColorData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
}

// List response
interface GemstoneColorListResponse {
  success: boolean
  message: string
  data: {
    items: GemstoneColor[]
  }
}

// Single item response
interface GemstoneColorResponse {
  success: boolean
  message: string
  data: GemstoneColor
}

// Gemstone Color service with API calls
const gemstoneColorService = {
  // List all gemstone colors
  list: async (): Promise<GemstoneColorListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_COLOR.LIST)
    return response.data
  },

  // Get single gemstone color by ID
  getById: async (id: string): Promise<GemstoneColorResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_COLOR.GET(id))
    return response.data
  },

  // Create gemstone color
  create: async (data: CreateGemstoneColorData): Promise<GemstoneColorResponse> => {
    const response = await apiService.post(API_ENDPOINTS.GEMSTONE_COLOR.CREATE, data)
    return response.data
  },

  // Update gemstone color
  update: async (id: string, data: UpdateGemstoneColorData): Promise<GemstoneColorResponse> => {
    const response = await apiService.put(API_ENDPOINTS.GEMSTONE_COLOR.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_COLOR.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete gemstone color
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.GEMSTONE_COLOR.DELETE(id))
    return response.data
  },
}

export default gemstoneColorService
