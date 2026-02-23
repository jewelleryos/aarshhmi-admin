import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Metal Purity interface - matches backend response
export interface MetalPurity {
  id: string
  metal_type_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  image_alt_text: string | null
  price: number // Stored in smallest unit (paise/cents)
  status: boolean
  created_at: string
  updated_at: string
  metal_type_name: string // Joined from metal_types table
}

// Create Metal Purity request
export interface CreateMetalPurityData {
  metal_type_id: string
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  price: number // Send actual amount (e.g., 6500.50)
  status?: boolean
}

// Update Metal Purity request (metal_type_id NOT included - cannot change)
export interface UpdateMetalPurityData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  price?: number // Send actual amount (e.g., 6500.50)
  status?: boolean
}

// List response
interface MetalPurityListResponse {
  success: boolean
  message: string
  data: {
    items: MetalPurity[]
  }
}

// Single item response
interface MetalPurityResponse {
  success: boolean
  message: string
  data: MetalPurity
}

// Metal Purity service with API calls
const metalPurityService = {
  // List all metal purities
  list: async (): Promise<MetalPurityListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_PURITY.LIST)
    return response.data
  },

  // Get single metal purity by ID
  getById: async (id: string): Promise<MetalPurityResponse> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_PURITY.GET(id))
    return response.data
  },

  // Create metal purity
  create: async (data: CreateMetalPurityData): Promise<MetalPurityResponse> => {
    const response = await apiService.post(API_ENDPOINTS.METAL_PURITY.CREATE, data)
    return response.data
  },

  // Update metal purity
  update: async (id: string, data: UpdateMetalPurityData): Promise<MetalPurityResponse> => {
    const response = await apiService.put(API_ENDPOINTS.METAL_PURITY.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.METAL_PURITY.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete metal purity
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.METAL_PURITY.DELETE(id))
    return response.data
  },
}

export default metalPurityService
