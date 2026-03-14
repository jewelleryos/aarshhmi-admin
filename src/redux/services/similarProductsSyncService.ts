import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface ScoringCondition {
  id: string
  condition_key: string
  label: string
  description: string | null
  weight: number
  is_active: boolean
  rank: number
}

export interface SyncJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'failed'
  triggered_by: string | null
  total_products: number
  processed_products: number
  failed_products: number
  error_details: Array<{ productId: string; productName: string; error: string }>
  started_at: string | null
  completed_at: string | null
  created_at: string
}

interface ConfigListResponse {
  success: boolean
  message: string
  data: { items: ScoringCondition[] }
}

interface ConfigUpdateResponse {
  success: boolean
  message: string
  data: ScoringCondition
}

interface JobsListResponse {
  success: boolean
  message: string
  data: { items: SyncJob[] }
}

const similarProductsSyncService = {
  listConfig: async (): Promise<ConfigListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIMILAR_PRODUCTS.CONFIG)
    return response.data
  },

  updateConfig: async (id: string, data: { weight?: number; is_active?: boolean }): Promise<ConfigUpdateResponse> => {
    const response = await apiService.put(API_ENDPOINTS.SIMILAR_PRODUCTS.CONFIG_UPDATE(id), data)
    return response.data
  },

  listJobs: async (): Promise<JobsListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIMILAR_PRODUCTS.SYNC_JOBS)
    return response.data
  },
}

export default similarProductsSyncService
