import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Metal Type interface - matches backend response
export interface MetalType {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  image_alt_text: string | null
  status: boolean
  created_at: string
  updated_at: string
}

// Create Metal Type request
export interface CreateMetalTypeData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Metal Type request
export interface UpdateMetalTypeData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// List response
interface MetalTypeListResponse {
  success: boolean
  message: string
  data: {
    items: MetalType[]
  }
}

// Single item response
interface MetalTypeResponse {
  success: boolean
  message: string
  data: MetalType
}

// Metal Type service with API calls
const metalTypeService = {
  // List all metal types
  list: async (): Promise<MetalTypeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_TYPE.LIST)
    return response.data
  },

  // Get single metal type by ID
  getById: async (id: string): Promise<MetalTypeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_TYPE.GET(id))
    return response.data
  },

  // Create metal type
  create: async (data: CreateMetalTypeData): Promise<MetalTypeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.METAL_TYPE.CREATE, data)
    return response.data
  },

  // Update metal type
  update: async (id: string, data: UpdateMetalTypeData): Promise<MetalTypeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.METAL_TYPE.UPDATE(id), data)
    return response.data
  },

  // Get metal types for metal color dropdown (minimal data)
  getForMetalColor: async (): Promise<{ success: boolean; message: string; data: { id: string; name: string }[] }> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_TYPE.FOR_METAL_COLOR)
    return response.data
  },

  // Get metal types for metal purity dropdown (minimal data)
  getForMetalPurity: async (): Promise<{ success: boolean; message: string; data: { id: string; name: string }[] }> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_TYPE.FOR_METAL_PURITY)
    return response.data
  },

  // Get metal types for making charge dropdown (minimal data)
  getForMakingCharge: async (): Promise<{ success: boolean; message: string; data: { id: string; name: string }[] }> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_TYPE.FOR_MAKING_CHARGE)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_TYPE.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete metal type
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.METAL_TYPE.DELETE(id))
    return response.data
  },
}

export default metalTypeService
