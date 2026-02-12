import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import diamondPricingService, {
  DiamondPrice,
  CreateDiamondPriceData,
  UpdateDiamondPriceData,
  DiamondPriceFilters,
  DropdownItem,
  BulkCreateResponse,
  BulkUpdateResponse,
} from '@/redux/services/diamondPricingService'

// Bulk operation state interface
interface BulkState {
  isDownloading: boolean
  isUploading: boolean
  uploadResult: BulkCreateResponse | BulkUpdateResponse | null
  error: string | null
}

// Diamond Pricing state interface
interface DiamondPricingState {
  items: DiamondPrice[]
  shapes: DropdownItem[]
  qualities: DropdownItem[]
  filters: DiamondPriceFilters
  selectedItem: DiamondPrice | null
  isLoading: boolean
  error: string | null
  bulk: BulkState
}

// Initial state
const initialState: DiamondPricingState = {
  items: [],
  shapes: [],
  qualities: [],
  filters: {},
  selectedItem: null,
  isLoading: false,
  error: null,
  bulk: {
    isDownloading: false,
    isUploading: false,
    uploadResult: null,
    error: null,
  },
}

// Fetch all diamond prices
export const fetchDiamondPrices = createAsyncThunk(
  'diamondPricing/fetchAll',
  async (filters: DiamondPriceFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await diamondPricingService.list(filters)
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch diamond prices'
      )
    }
  }
)

// Fetch shapes for dropdown
export const fetchShapes = createAsyncThunk('diamondPricing/fetchShapes', async (_, { rejectWithValue }) => {
  try {
    const response = await diamondPricingService.getShapes()
    return response.data.items
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch shapes')
  }
})

// Fetch qualities for dropdown
export const fetchQualities = createAsyncThunk(
  'diamondPricing/fetchQualities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await diamondPricingService.getQualities()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch qualities')
    }
  }
)

// Create diamond price
export const createDiamondPrice = createAsyncThunk(
  'diamondPricing/create',
  async (data: CreateDiamondPriceData, { rejectWithValue }) => {
    try {
      const response = await diamondPricingService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create diamond price'
      )
    }
  }
)

// Update diamond price
export const updateDiamondPrice = createAsyncThunk(
  'diamondPricing/update',
  async ({ id, data }: { id: string; data: UpdateDiamondPriceData }, { rejectWithValue }) => {
    try {
      const response = await diamondPricingService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update diamond price'
      )
    }
  }
)

// ============ Bulk Operations ============

// Download template
export const downloadTemplate = createAsyncThunk(
  'diamondPricing/downloadTemplate',
  async (_, { rejectWithValue }) => {
    try {
      await diamondPricingService.downloadTemplate()
      return true
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to download template'
      )
    }
  }
)

// Download reference
export const downloadReference = createAsyncThunk(
  'diamondPricing/downloadReference',
  async (_, { rejectWithValue }) => {
    try {
      await diamondPricingService.downloadReference()
      return true
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to download reference data'
      )
    }
  }
)

// Export prices
export const exportPrices = createAsyncThunk(
  'diamondPricing/exportPrices',
  async (filters: DiamondPriceFilters | undefined, { rejectWithValue }) => {
    try {
      await diamondPricingService.exportPrices(filters)
      return true
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to export prices'
      )
    }
  }
)

// Bulk create
export const bulkCreatePrices = createAsyncThunk(
  'diamondPricing/bulkCreate',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await diamondPricingService.bulkCreate(file)
      return response
    } catch (error: any) {
      // Return error response data if available (for validation errors with row details)
      if (error.response?.data?.data) {
        return error.response.data as BulkCreateResponse
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to process bulk create'
      )
    }
  }
)

// Bulk update
export const bulkUpdatePrices = createAsyncThunk(
  'diamondPricing/bulkUpdate',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await diamondPricingService.bulkUpdate(file)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to process bulk update'
      )
    }
  }
)

// Create the diamond pricing slice
const diamondPricingSlice = createSlice({
  name: 'diamondPricing',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<DiamondPrice | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
    // Set filters
    setFilters: (state, action: PayloadAction<DiamondPriceFilters>) => {
      state.filters = action.payload
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = {}
    },
    // Clear bulk upload result
    clearBulkResult: (state) => {
      state.bulk.uploadResult = null
      state.bulk.error = null
    },
    // Reset bulk state
    resetBulkState: (state) => {
      state.bulk = {
        isDownloading: false,
        isUploading: false,
        uploadResult: null,
        error: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch diamond prices cases
      .addCase(fetchDiamondPrices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDiamondPrices.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchDiamondPrices.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch diamond prices'
      })
      // Fetch shapes cases
      .addCase(fetchShapes.fulfilled, (state, action) => {
        state.shapes = action.payload
      })
      // Fetch qualities cases
      .addCase(fetchQualities.fulfilled, (state, action) => {
        state.qualities = action.payload
      })
      // Create diamond price cases
      .addCase(createDiamondPrice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDiamondPrice.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createDiamondPrice.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create diamond price'
      })
      // Update diamond price cases
      .addCase(updateDiamondPrice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDiamondPrice.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateDiamondPrice.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update diamond price'
      })
      // ============ Bulk Operations ============
      // Download template
      .addCase(downloadTemplate.pending, (state) => {
        state.bulk.isDownloading = true
        state.bulk.error = null
      })
      .addCase(downloadTemplate.fulfilled, (state) => {
        state.bulk.isDownloading = false
      })
      .addCase(downloadTemplate.rejected, (state, action) => {
        state.bulk.isDownloading = false
        state.bulk.error = (action.payload as string) || 'Failed to download template'
      })
      // Download reference
      .addCase(downloadReference.pending, (state) => {
        state.bulk.isDownloading = true
        state.bulk.error = null
      })
      .addCase(downloadReference.fulfilled, (state) => {
        state.bulk.isDownloading = false
      })
      .addCase(downloadReference.rejected, (state, action) => {
        state.bulk.isDownloading = false
        state.bulk.error = (action.payload as string) || 'Failed to download reference'
      })
      // Export prices
      .addCase(exportPrices.pending, (state) => {
        state.bulk.isDownloading = true
        state.bulk.error = null
      })
      .addCase(exportPrices.fulfilled, (state) => {
        state.bulk.isDownloading = false
      })
      .addCase(exportPrices.rejected, (state, action) => {
        state.bulk.isDownloading = false
        state.bulk.error = (action.payload as string) || 'Failed to export prices'
      })
      // Bulk create
      .addCase(bulkCreatePrices.pending, (state) => {
        state.bulk.isUploading = true
        state.bulk.uploadResult = null
        state.bulk.error = null
      })
      .addCase(bulkCreatePrices.fulfilled, (state, action) => {
        state.bulk.isUploading = false
        state.bulk.uploadResult = action.payload
      })
      .addCase(bulkCreatePrices.rejected, (state, action) => {
        state.bulk.isUploading = false
        state.bulk.error = (action.payload as string) || 'Failed to process bulk create'
      })
      // Bulk update
      .addCase(bulkUpdatePrices.pending, (state) => {
        state.bulk.isUploading = true
        state.bulk.uploadResult = null
        state.bulk.error = null
      })
      .addCase(bulkUpdatePrices.fulfilled, (state, action) => {
        state.bulk.isUploading = false
        state.bulk.uploadResult = action.payload
      })
      .addCase(bulkUpdatePrices.rejected, (state, action) => {
        state.bulk.isUploading = false
        state.bulk.error = (action.payload as string) || 'Failed to process bulk update'
      })
  },
})

// Export actions
export const {
  clearError,
  setSelectedItem,
  clearSelectedItem,
  setFilters,
  clearFilters,
  clearBulkResult,
  resetBulkState,
} = diamondPricingSlice.actions

// Export reducer
export default diamondPricingSlice.reducer
