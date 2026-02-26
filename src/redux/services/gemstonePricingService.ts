import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Gemstone Price interface - matches backend response
export interface GemstonePrice {
  id: string
  stone_group_id: string
  stone_type_id: string
  stone_shape_id: string
  stone_quality_id: string
  stone_color_id: string
  ct_from: number
  ct_to: number
  price: number
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  type_name?: string
  shape_name?: string
  quality_name?: string
  color_name?: string
}

// Create Gemstone Price request
export interface CreateGemstonePriceData {
  stone_type_id: string
  stone_shape_id: string
  stone_quality_id: string
  stone_color_id: string
  ct_from: number
  ct_to: number
  price: number
  status?: boolean
}

// Update Gemstone Price request
export interface UpdateGemstonePriceData {
  stone_type_id?: string
  stone_shape_id?: string
  stone_quality_id?: string
  stone_color_id?: string
  ct_from?: number
  ct_to?: number
  price?: number
  status?: boolean
}

// Filter options
export interface GemstonePriceFilters {
  stone_type_id?: string
  stone_shape_id?: string
  stone_quality_id?: string
  stone_color_id?: string
}

// Dropdown item interface
export interface DropdownItem {
  id: string
  name: string
  slug: string
}

// List response
interface GemstonePriceListResponse {
  success: boolean
  message: string
  data: {
    items: GemstonePrice[]
  }
}

// Single item response
interface GemstonePriceResponse {
  success: boolean
  message: string
  data: GemstonePrice
}

// ============ Bulk Operation Types ============

// Bulk create success item
export interface BulkCreateSuccessItem {
  row: number
  id: string
  gemstone_type: string
  shape: string
  quality: string
  color: string
  from: number
  to: number
  price: number
}

// Bulk create success response data
export interface BulkCreateSuccessData {
  created_count: number
  created: BulkCreateSuccessItem[]
}

// Bulk create error item
export interface BulkCreateErrorItem {
  row: number
  error: string
  data?: {
    gemstone_type?: string
    shape?: string
    quality?: string
    color?: string
    from?: number
    to?: number
    price?: number
  }
}

// Bulk create error response data
export interface BulkCreateErrorData {
  total_rows: number
  error_count: number
  errors: BulkCreateErrorItem[]
}

// Bulk create response (can be success or error)
export interface BulkCreateResponse {
  success: boolean
  message: string
  data: BulkCreateSuccessData | BulkCreateErrorData
}

// Bulk update failed item
export interface BulkUpdateFailedItem {
  row: number
  error: string
  data?: {
    id?: string
    gemstone_type?: string
    shape?: string
    quality?: string
    color?: string
    price?: number
  }
}

// Bulk update warning item
export interface BulkUpdateWarningItem {
  row: number
  warning: string
  data?: {
    id?: string
    gemstone_type?: string
    shape?: string
    quality?: string
    color?: string
  }
}

// Bulk update response data
export interface BulkUpdateResponseData {
  summary: {
    total: number
    updated: number
    failed: number
  }
  failed: BulkUpdateFailedItem[]
  warnings: BulkUpdateWarningItem[]
}

// Bulk update response
export interface BulkUpdateResponse {
  success: boolean
  message: string
  data: BulkUpdateResponseData
}

// Dropdown response
interface DropdownResponse {
  success: boolean
  message: string
  data: {
    items: DropdownItem[]
  }
}

// Gemstone Pricing service with API calls
const gemstonePricingService = {
  // List all gemstone prices with optional filters
  list: async (filters?: GemstonePriceFilters): Promise<GemstonePriceListResponse> => {
    const params = new URLSearchParams()
    if (filters?.stone_type_id) params.append('stone_type_id', filters.stone_type_id)
    if (filters?.stone_shape_id) params.append('stone_shape_id', filters.stone_shape_id)
    if (filters?.stone_quality_id) params.append('stone_quality_id', filters.stone_quality_id)
    if (filters?.stone_color_id) params.append('stone_color_id', filters.stone_color_id)

    const url = params.toString()
      ? `${API_ENDPOINTS.GEMSTONE_PRICING.LIST}?${params.toString()}`
      : API_ENDPOINTS.GEMSTONE_PRICING.LIST

    const response = await apiService.get(url)
    return response.data
  },

  // Get single gemstone price by ID
  getById: async (id: string): Promise<GemstonePriceResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_PRICING.GET(id))
    return response.data
  },

  // Create gemstone price
  create: async (data: CreateGemstonePriceData): Promise<GemstonePriceResponse> => {
    const response = await apiService.post(API_ENDPOINTS.GEMSTONE_PRICING.CREATE, data)
    return response.data
  },

  // Update gemstone price
  update: async (id: string, data: UpdateGemstonePriceData): Promise<GemstonePriceResponse> => {
    const response = await apiService.put(API_ENDPOINTS.GEMSTONE_PRICING.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_PRICING.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete gemstone price
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.GEMSTONE_PRICING.DELETE(id))
    return response.data
  },

  // Get gemstone types for dropdown
  getGemstoneTypes: async (): Promise<DropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_TYPE_DROPDOWN)
    return response.data
  },

  // Get shapes for dropdown
  getShapes: async (): Promise<DropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STONE_SHAPE_DROPDOWN)
    return response.data
  },

  // Get gemstone qualities for dropdown
  getQualities: async (): Promise<DropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_QUALITY_DROPDOWN)
    return response.data
  },

  // Get gemstone colors for dropdown
  getColors: async (): Promise<DropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_COLOR_DROPDOWN)
    return response.data
  },

  // ============ Bulk Operations ============

  // Download template CSV
  downloadTemplate: async (): Promise<void> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_PRICING.TEMPLATE, {
      responseType: 'blob',
    })
    downloadFile(response.data, 'gemstone-pricing-template.csv')
  },

  // Download reference data CSV
  downloadReference: async (): Promise<void> => {
    const response = await apiService.get(API_ENDPOINTS.GEMSTONE_PRICING.REFERENCE, {
      responseType: 'blob',
    })
    downloadFile(response.data, 'gemstone-pricing-reference.csv')
  },

  // Export current prices CSV
  exportPrices: async (filters?: GemstonePriceFilters): Promise<void> => {
    const params = new URLSearchParams()
    if (filters?.stone_type_id) params.append('stone_type_id', filters.stone_type_id)
    if (filters?.stone_shape_id) params.append('stone_shape_id', filters.stone_shape_id)
    if (filters?.stone_quality_id) params.append('stone_quality_id', filters.stone_quality_id)
    if (filters?.stone_color_id) params.append('stone_color_id', filters.stone_color_id)

    const url = params.toString()
      ? `${API_ENDPOINTS.GEMSTONE_PRICING.EXPORT}?${params.toString()}`
      : API_ENDPOINTS.GEMSTONE_PRICING.EXPORT

    const response = await apiService.get(url, {
      responseType: 'blob',
    })
    const timestamp = Date.now()
    downloadFile(response.data, `gemstone-prices-${timestamp}.csv`)
  },

  // Bulk create from CSV
  bulkCreate: async (file: File): Promise<BulkCreateResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.post(API_ENDPOINTS.GEMSTONE_PRICING.BULK_CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Bulk update from CSV
  bulkUpdate: async (file: File): Promise<BulkUpdateResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.post(API_ENDPOINTS.GEMSTONE_PRICING.BULK_UPDATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// Helper function for file download
function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default gemstonePricingService
