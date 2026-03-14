import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface SimilarProductListItem {
  id: string
  name: string
  base_sku: string
  status: string
  selling_price: number | null
  similar_count: number
  manual_count: number
  system_count: number
}

export interface SimilarProductEntry {
  id: string
  product: {
    id: string
    name: string
    base_sku: string
    selling_price: number | null
    status: string
  }
  score?: number
  rank: number
}

export interface SimilarProductsDetail {
  manual: SimilarProductEntry[]
  system: SimilarProductEntry[]
  totalCount: number
  manualCount: number
  systemCount: number
}

interface ListResponse {
  success: boolean
  message: string
  data: {
    items: SimilarProductListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

interface DetailResponse {
  success: boolean
  message: string
  data: SimilarProductsDetail
}

export interface ProductForSelection {
  id: string
  name: string
  base_sku: string
}

interface ProductsForSelectionResponse {
  success: boolean
  message: string
  data: { items: ProductForSelection[] }
}

interface TriggerResponse {
  success: boolean
  message: string
  data: null
}

const similarProductsService = {
  listProducts: async (params?: { search?: string; page?: number; limit?: number }): Promise<ListResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.set('search', params.search)
    if (params?.page) queryParams.set('page', String(params.page))
    if (params?.limit) queryParams.set('limit', String(params.limit))
    const query = queryParams.toString()
    const url = `${API_ENDPOINTS.SIMILAR_PRODUCTS.LIST}${query ? `?${query}` : ''}`
    const response = await apiService.get(url)
    return response.data
  },

  getSimilarProducts: async (productId: string): Promise<DetailResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIMILAR_PRODUCTS.GET(productId))
    return response.data
  },

  updateManualPicks: async (productId: string, manualProductIds: string[], removedSystemProductIds?: string[]): Promise<DetailResponse> => {
    const response = await apiService.put(API_ENDPOINTS.SIMILAR_PRODUCTS.UPDATE(productId), {
      manual_product_ids: manualProductIds,
      ...(removedSystemProductIds && removedSystemProductIds.length > 0 && { removed_system_product_ids: removedSystemProductIds }),
    })
    return response.data
  },

  getProductsForSelection: async (): Promise<ProductsForSelectionResponse> => {
    const response = await apiService.get(API_ENDPOINTS.SIMILAR_PRODUCTS.PRODUCTS_FOR_SELECTION)
    return response.data
  },

  triggerSync: async (): Promise<TriggerResponse> => {
    const response = await apiService.post(API_ENDPOINTS.SIMILAR_PRODUCTS.SYNC)
    return response.data
  },
}

export default similarProductsService
