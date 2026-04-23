import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Review list item (admin list response)
export interface ProductReviewListItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  type: 'system' | 'user'
  customer_name: string
  title: string
  rating: number
  status: boolean
  approval_status: 'approved' | 'pending' | 'rejected'
  review_date: string
  created_at: string
}

// Full review (single item response)
export interface ProductReview {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  type: 'system' | 'user'
  user_id: string | null
  order_id: string | null
  customer_name: string
  customer_image_path: string | null
  title: string
  rating: number
  description: string
  order_date: string | null
  review_date: string
  media: ReviewMediaItem[]
  metadata: Record<string, unknown>
  status: boolean
  approval_status: 'approved' | 'pending' | 'rejected'
  created_at: string
  updated_at: string
}

export interface ReviewMediaItem {
  id: string
  type: 'image' | 'video'
  path: string
  alt_text: string
}

export interface CreateProductReviewData {
  product_id: string
  customer_name: string
  customer_image_path?: string | null
  title: string
  rating: number
  description: string
  order_date: string
  review_date: string
  media?: ReviewMediaItem[]
  metadata?: Record<string, unknown>
  status?: boolean
}

export interface UpdateProductReviewData {
  customer_name?: string
  customer_image_path?: string | null
  title?: string
  rating?: number
  description?: string
  order_date?: string
  review_date?: string
  media?: ReviewMediaItem[]
  metadata?: Record<string, unknown>
  status?: boolean
}

export interface ProductDropdownItem {
  id: string
  name: string
  base_sku: string
}

interface ListResponse {
  success: boolean
  message: string
  data: { items: ProductReviewListItem[] }
}

interface SingleResponse {
  success: boolean
  message: string
  data: ProductReview
}

const productReviewService = {
  list: async (): Promise<ListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT_REVIEW.LIST)
    return response.data
  },

  getById: async (id: string): Promise<SingleResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT_REVIEW.GET(id))
    return response.data
  },

  create: async (data: CreateProductReviewData): Promise<SingleResponse> => {
    const response = await apiService.post(API_ENDPOINTS.PRODUCT_REVIEW.CREATE, data)
    return response.data
  },

  update: async (id: string, data: UpdateProductReviewData): Promise<SingleResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PRODUCT_REVIEW.UPDATE(id), data)
    return response.data
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.PRODUCT_REVIEW.DELETE(id))
    return response.data
  },

  updateApproval: async (id: string, approval_status: 'approved' | 'rejected'): Promise<SingleResponse> => {
    const response = await apiService.patch(API_ENDPOINTS.PRODUCT_REVIEW.APPROVAL(id), { approval_status })
    return response.data
  },

  updateStatus: async (id: string, status: boolean): Promise<SingleResponse> => {
    const response = await apiService.patch(API_ENDPOINTS.PRODUCT_REVIEW.STATUS(id), { status })
    return response.data
  },

  getProductsDropdown: async (): Promise<{ success: boolean; message: string; data: { items: ProductDropdownItem[] } }> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT_REVIEW.PRODUCTS_DROPDOWN)
    return response.data
  },
}

export default productReviewService
