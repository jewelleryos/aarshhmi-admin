import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import pearlQualityService, {
  PearlQuality,
  CreatePearlQualityData,
  UpdatePearlQualityData,
} from '@/redux/services/pearlQualityService'

// Pearl Quality state interface
interface PearlQualityState {
  items: PearlQuality[]
  selectedItem: PearlQuality | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: PearlQualityState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all pearl qualities
export const fetchPearlQualities = createAsyncThunk(
  'pearlQuality/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pearlQualityService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pearl qualities'
      )
    }
  }
)

// Create pearl quality
export const createPearlQuality = createAsyncThunk(
  'pearlQuality/create',
  async (data: CreatePearlQualityData, { rejectWithValue }) => {
    try {
      const response = await pearlQualityService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create pearl quality'
      )
    }
  }
)

// Update pearl quality
export const updatePearlQuality = createAsyncThunk(
  'pearlQuality/update',
  async ({ id, data }: { id: string; data: UpdatePearlQualityData }, { rejectWithValue }) => {
    try {
      const response = await pearlQualityService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update pearl quality'
      )
    }
  }
)

// Create the pearl quality slice
const pearlQualitySlice = createSlice({
  name: 'pearlQuality',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<PearlQuality | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pearl qualities cases
      .addCase(fetchPearlQualities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPearlQualities.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchPearlQualities.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch pearl qualities'
      })
      // Create pearl quality cases
      .addCase(createPearlQuality.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPearlQuality.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createPearlQuality.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create pearl quality'
      })
      // Update pearl quality cases
      .addCase(updatePearlQuality.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePearlQuality.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updatePearlQuality.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update pearl quality'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = pearlQualitySlice.actions

// Export reducer
export default pearlQualitySlice.reducer
