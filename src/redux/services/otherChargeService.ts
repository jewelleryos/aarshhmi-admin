import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Other Charge interface - matches backend response
export interface OtherCharge {
  id: string
  name: string
  description: string | null
  amount: number // Stored in smallest unit (paise)
  metadata: Record<string, unknown>
  status: boolean
  created_at: string
  updated_at: string
}

// Create Other Charge request
export interface CreateOtherChargeData {
  name: string
  description?: string | null
  amount: number // User enters rupees, backend converts to paise
  metadata?: Record<string, unknown>
}

// Update Other Charge request
export interface UpdateOtherChargeData {
  name?: string
  description?: string | null
  amount?: number // User enters rupees, backend converts to paise
  metadata?: Record<string, unknown>
}

// List response
interface OtherChargeListResponse {
  success: boolean
  message: string
  data: {
    items: OtherCharge[]
  }
}

// Single item response
interface OtherChargeResponse {
  success: boolean
  message: string
  data: OtherCharge
}

// Delete response
interface DeleteResponse {
  success: boolean
  message: string
  data: null
}

// Other Charge service with API calls
const otherChargeService = {
  // List all other charges
  list: async (): Promise<OtherChargeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.OTHER_CHARGES.LIST)
    return response.data
  },

  // Get single other charge by ID
  getById: async (id: string): Promise<OtherChargeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.OTHER_CHARGES.GET(id))
    return response.data
  },

  // Create other charge
  create: async (data: CreateOtherChargeData): Promise<OtherChargeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.OTHER_CHARGES.CREATE, data)
    return response.data
  },

  // Update other charge
  update: async (id: string, data: UpdateOtherChargeData): Promise<OtherChargeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.OTHER_CHARGES.UPDATE(id), data)
    return response.data
  },

  // Delete other charge
  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.OTHER_CHARGES.DELETE(id))
    return response.data
  },
}

export default otherChargeService
