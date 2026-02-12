import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Making Charge interface - matches backend response
export interface MakingCharge {
  id: string
  metal_type_id: string
  from: string // Decimal as string from backend
  to: string // Decimal as string from backend
  is_fixed_pricing: boolean
  amount: string // Decimal as string from backend (stored as-is)
  metadata: Record<string, unknown>
  status: boolean
  created_at: string
  updated_at: string
  metal_type_name: string // Joined from metal_types table
}

// Create Making Charge request
export interface CreateMakingChargeData {
  metal_type_id: string
  from: number
  to: number
  is_fixed_pricing: boolean
  amount: number // Stored as-is (no conversion)
}

// Update Making Charge request
export interface UpdateMakingChargeData {
  metal_type_id?: string
  from?: number
  to?: number
  is_fixed_pricing?: boolean
  amount?: number // Stored as-is (no conversion)
}

// List response
interface MakingChargeListResponse {
  success: boolean
  message: string
  data: {
    items: MakingCharge[]
  }
}

// Single item response
interface MakingChargeResponse {
  success: boolean
  message: string
  data: MakingCharge
}

// Making Charge service with API calls
const makingChargeService = {
  // List all making charges
  list: async (): Promise<MakingChargeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.MAKING_CHARGES.LIST)
    return response.data
  },

  // Get single making charge by ID
  getById: async (id: string): Promise<MakingChargeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.MAKING_CHARGES.GET(id))
    return response.data
  },

  // Create making charge
  create: async (data: CreateMakingChargeData): Promise<MakingChargeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.MAKING_CHARGES.CREATE, data)
    return response.data
  },

  // Update making charge
  update: async (id: string, data: UpdateMakingChargeData): Promise<MakingChargeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.MAKING_CHARGES.UPDATE(id), data)
    return response.data
  },
}

export default makingChargeService
