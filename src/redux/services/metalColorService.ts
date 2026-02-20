import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Metal Color interface - matches backend response
export interface MetalColor {
  id: string
  metal_type_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  image_alt_text: string | null
  status: boolean
  created_at: string
  updated_at: string
  metal_type_name: string // Joined from metal_types table
}

// Create Metal Color request
export interface CreateMetalColorData {
  metal_type_id: string
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Metal Color request (metal_type_id NOT included - cannot change)
export interface UpdateMetalColorData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// List response
interface MetalColorListResponse {
  success: boolean
  message: string
  data: {
    items: MetalColor[]
  }
}

// Single item response
interface MetalColorResponse {
  success: boolean
  message: string
  data: MetalColor
}

// Metal Color service with API calls
const metalColorService = {
  // List all metal colors
  list: async (): Promise<MetalColorListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_COLOR.LIST)
    return response.data
  },

  // Get single metal color by ID
  getById: async (id: string): Promise<MetalColorResponse> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_COLOR.GET(id))
    return response.data
  },

  // Create metal color
  create: async (data: CreateMetalColorData): Promise<MetalColorResponse> => {
    const response = await apiService.post(API_ENDPOINTS.METAL_COLOR.CREATE, data)
    return response.data
  },

  // Update metal color
  update: async (id: string, data: UpdateMetalColorData): Promise<MetalColorResponse> => {
    const response = await apiService.put(API_ENDPOINTS.METAL_COLOR.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_COLOR.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete metal color
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.METAL_COLOR.DELETE(id))
    return response.data
  },
}

export default metalColorService
