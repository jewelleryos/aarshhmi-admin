import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import gemstoneQualityService, {
  GemstoneQuality,
  CreateGemstoneQualityData,
  UpdateGemstoneQualityData,
} from '@/redux/services/gemstoneQualityService'

// Gemstone Quality state interface
interface GemstoneQualityState {
  items: GemstoneQuality[]
  selectedItem: GemstoneQuality | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: GemstoneQualityState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all gemstone qualities
export const fetchGemstoneQualities = createAsyncThunk(
  'gemstoneQuality/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gemstoneQualityService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone qualities'
      )
    }
  }
)

// Create gemstone quality
export const createGemstoneQuality = createAsyncThunk(
  'gemstoneQuality/create',
  async (data: CreateGemstoneQualityData, { rejectWithValue }) => {
    try {
      const response = await gemstoneQualityService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create gemstone quality'
      )
    }
  }
)

// Update gemstone quality
export const updateGemstoneQuality = createAsyncThunk(
  'gemstoneQuality/update',
  async ({ id, data }: { id: string; data: UpdateGemstoneQualityData }, { rejectWithValue }) => {
    try {
      const response = await gemstoneQualityService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update gemstone quality'
      )
    }
  }
)

// Create the gemstone quality slice
const gemstoneQualitySlice = createSlice({
  name: 'gemstoneQuality',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<GemstoneQuality | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gemstone qualities cases
      .addCase(fetchGemstoneQualities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGemstoneQualities.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchGemstoneQualities.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone qualities'
      })
      // Create gemstone quality cases
      .addCase(createGemstoneQuality.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGemstoneQuality.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createGemstoneQuality.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create gemstone quality'
      })
      // Update gemstone quality cases
      .addCase(updateGemstoneQuality.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateGemstoneQuality.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateGemstoneQuality.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update gemstone quality'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = gemstoneQualitySlice.actions

// Export reducer
export default gemstoneQualitySlice.reducer
