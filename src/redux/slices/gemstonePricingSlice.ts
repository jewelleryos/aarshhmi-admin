import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import gemstonePricingService, {
  GemstonePrice,
  CreateGemstonePriceData,
  UpdateGemstonePriceData,
  GemstonePriceFilters,
  DropdownItem,
  BulkCreateResponse,
  BulkUpdateResponse,
} from '@/redux/services/gemstonePricingService'

// Bulk operation state interface
interface BulkState {
  isDownloading: boolean
  isUploading: boolean
  uploadResult: BulkCreateResponse | BulkUpdateResponse | null
  error: string | null
}

// Gemstone Pricing state interface
interface GemstonePricingState {
  items: GemstonePrice[]
  gemstoneTypes: DropdownItem[]
  shapes: DropdownItem[]
  qualities: DropdownItem[]
  colors: DropdownItem[]
  filters: GemstonePriceFilters
  selectedItem: GemstonePrice | null
  isLoading: boolean
  error: string | null
  bulk: BulkState
}

// Initial state
const initialState: GemstonePricingState = {
  items: [],
  gemstoneTypes: [],
  shapes: [],
  qualities: [],
  colors: [],
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

// Fetch all gemstone prices
export const fetchGemstonePrices = createAsyncThunk(
  'gemstonePricing/fetchAll',
  async (filters: GemstonePriceFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.list(filters)
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone prices'
      )
    }
  }
)

// Fetch gemstone types for dropdown
export const fetchGemstoneTypes = createAsyncThunk(
  'gemstonePricing/fetchGemstoneTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.getGemstoneTypes()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch gemstone types')
    }
  }
)

// Fetch shapes for dropdown
export const fetchShapes = createAsyncThunk('gemstonePricing/fetchShapes', async (_, { rejectWithValue }) => {
  try {
    const response = await gemstonePricingService.getShapes()
    return response.data.items
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch shapes')
  }
})

// Fetch qualities for dropdown
export const fetchQualities = createAsyncThunk(
  'gemstonePricing/fetchQualities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.getQualities()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch qualities')
    }
  }
)

// Fetch colors for dropdown
export const fetchColors = createAsyncThunk(
  'gemstonePricing/fetchColors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.getColors()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch colors')
    }
  }
)

// Fetch all dropdowns in parallel
export const fetchDropdowns = createAsyncThunk(
  'gemstonePricing/fetchDropdowns',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchGemstoneTypes()),
      dispatch(fetchShapes()),
      dispatch(fetchQualities()),
      dispatch(fetchColors()),
    ])
    return true
  }
)

// Create gemstone price
export const createGemstonePrice = createAsyncThunk(
  'gemstonePricing/create',
  async (data: CreateGemstonePriceData, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create gemstone price'
      )
    }
  }
)

// Update gemstone price
export const updateGemstonePrice = createAsyncThunk(
  'gemstonePricing/update',
  async ({ id, data }: { id: string; data: UpdateGemstonePriceData }, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update gemstone price'
      )
    }
  }
)

// ============ Bulk Operations ============

// Download template
export const downloadTemplate = createAsyncThunk(
  'gemstonePricing/downloadTemplate',
  async (_, { rejectWithValue }) => {
    try {
      await gemstonePricingService.downloadTemplate()
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
  'gemstonePricing/downloadReference',
  async (_, { rejectWithValue }) => {
    try {
      await gemstonePricingService.downloadReference()
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
  'gemstonePricing/exportPrices',
  async (filters: GemstonePriceFilters | undefined, { rejectWithValue }) => {
    try {
      await gemstonePricingService.exportPrices(filters)
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
  'gemstonePricing/bulkCreate',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.bulkCreate(file)
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
  'gemstonePricing/bulkUpdate',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await gemstonePricingService.bulkUpdate(file)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to process bulk update'
      )
    }
  }
)

// Create the gemstone pricing slice
const gemstonePricingSlice = createSlice({
  name: 'gemstonePricing',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<GemstonePrice | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
    // Set filters
    setFilters: (state, action: PayloadAction<GemstonePriceFilters>) => {
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
      // Fetch gemstone prices cases
      .addCase(fetchGemstonePrices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGemstonePrices.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchGemstonePrices.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone prices'
      })
      // Fetch gemstone types cases
      .addCase(fetchGemstoneTypes.fulfilled, (state, action) => {
        state.gemstoneTypes = action.payload
      })
      // Fetch shapes cases
      .addCase(fetchShapes.fulfilled, (state, action) => {
        state.shapes = action.payload
      })
      // Fetch qualities cases
      .addCase(fetchQualities.fulfilled, (state, action) => {
        state.qualities = action.payload
      })
      // Fetch colors cases
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.colors = action.payload
      })
      // Create gemstone price cases
      .addCase(createGemstonePrice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGemstonePrice.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createGemstonePrice.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create gemstone price'
      })
      // Update gemstone price cases
      .addCase(updateGemstonePrice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateGemstonePrice.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateGemstonePrice.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update gemstone price'
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
} = gemstonePricingSlice.actions

// Export reducer
export default gemstonePricingSlice.reducer
