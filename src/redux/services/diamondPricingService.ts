import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Diamond Price interface - matches backend response
export interface DiamondPrice {
  id: string
  stone_group_id: string
  stone_type_id: string
  stone_shape_id: string
  stone_quality_id: string
  stone_color_id: string | null
  ct_from: number
  ct_to: number
  price: number
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  shape_name?: string
  quality_name?: string
}

// Create Diamond Price request
export interface CreateDiamondPriceData {
  stone_shape_id: string
  stone_quality_id: string
  ct_from: number
  ct_to: number
  price: number
  status?: boolean
}

// Update Diamond Price request
export interface UpdateDiamondPriceData {
  stone_shape_id?: string
  stone_quality_id?: string
  ct_from?: number
  ct_to?: number
  price?: number
  status?: boolean
}

// Filter options
export interface DiamondPriceFilters {
  stone_shape_id?: string
  stone_quality_id?: string
}

// Dropdown item interface
export interface DropdownItem {
  id: string
  name: string
  slug: string
}

// List response
interface DiamondPriceListResponse {
  success: boolean
  message: string
  data: {
    items: DiamondPrice[]
  }
}

// Single item response
interface DiamondPriceResponse {
  success: boolean
  message: string
  data: DiamondPrice
}

// ============ Bulk Operation Types ============

// Bulk create success item
export interface BulkCreateSuccessItem {
  row: number
  id: string
  shape: string
  clarity_color: string
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
    shape?: string
    clarity_color?: string
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
    shape?: string
    clarity_color?: string
    price?: number
  }
}

// Bulk update warning item
export interface BulkUpdateWarningItem {
  row: number
  warning: string
  data?: {
    id?: string
    shape?: string
    clarity_color?: string
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

// Diamond Pricing service with API calls
const diamondPricingService = {
  // List all diamond prices with optional filters
  list: async (filters?: DiamondPriceFilters): Promise<DiamondPriceListResponse> => {
    const params = new URLSearchParams()
    if (filters?.stone_shape_id) params.append('stone_shape_id', filters.stone_shape_id)
    if (filters?.stone_quality_id) params.append('stone_quality_id', filters.stone_quality_id)

    const url = params.toString()
      ? `${API_ENDPOINTS.DIAMOND_PRICING.LIST}?${params.toString()}`
      : API_ENDPOINTS.DIAMOND_PRICING.LIST

    const response = await apiService.get(url)
    return response.data
  },

  // Get single diamond price by ID
  getById: async (id: string): Promise<DiamondPriceResponse> => {
    const response = await apiService.get(API_ENDPOINTS.DIAMOND_PRICING.GET(id))
    return response.data
  },

  // Create diamond price
  create: async (data: CreateDiamondPriceData): Promise<DiamondPriceResponse> => {
    const response = await apiService.post(API_ENDPOINTS.DIAMOND_PRICING.CREATE, data)
    return response.data
  },

  // Update diamond price
  update: async (id: string, data: UpdateDiamondPriceData): Promise<DiamondPriceResponse> => {
    const response = await apiService.put(API_ENDPOINTS.DIAMOND_PRICING.UPDATE(id), data)
    return response.data
  },

  // Get shapes for dropdown
  getShapes: async (): Promise<DropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STONE_SHAPE_DROPDOWN)
    return response.data
  },

  // Get qualities (clarity/color) for dropdown
  getQualities: async (): Promise<DropdownResponse> => {
    const response = await apiService.get(API_ENDPOINTS.DIAMOND_CLARITY_COLOR.DROPDOWN)
    return response.data
  },

  // ============ Bulk Operations ============

  // Download template CSV
  downloadTemplate: async (): Promise<void> => {
    const response = await apiService.get(API_ENDPOINTS.DIAMOND_PRICING.TEMPLATE, {
      responseType: 'blob',
    })
    downloadFile(response.data, 'diamond-pricing-template.csv')
  },

  // Download reference data CSV
  downloadReference: async (): Promise<void> => {
    const response = await apiService.get(API_ENDPOINTS.DIAMOND_PRICING.REFERENCE, {
      responseType: 'blob',
    })
    downloadFile(response.data, 'diamond-pricing-reference.csv')
  },

  // Export current prices CSV
  exportPrices: async (filters?: DiamondPriceFilters): Promise<void> => {
    const params = new URLSearchParams()
    if (filters?.stone_shape_id) params.append('stone_shape_id', filters.stone_shape_id)
    if (filters?.stone_quality_id) params.append('stone_quality_id', filters.stone_quality_id)

    const url = params.toString()
      ? `${API_ENDPOINTS.DIAMOND_PRICING.EXPORT}?${params.toString()}`
      : API_ENDPOINTS.DIAMOND_PRICING.EXPORT

    const response = await apiService.get(url, {
      responseType: 'blob',
    })
    const timestamp = Date.now()
    downloadFile(response.data, `diamond-prices-${timestamp}.csv`)
  },

  // Bulk create from CSV
  bulkCreate: async (file: File): Promise<BulkCreateResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.post(API_ENDPOINTS.DIAMOND_PRICING.BULK_CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Bulk update from CSV
  bulkUpdate: async (file: File): Promise<BulkUpdateResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.post(API_ENDPOINTS.DIAMOND_PRICING.BULK_UPDATE, formData, {
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

export default diamondPricingService
