import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import metalPurityService, {
  MetalPurity,
  CreateMetalPurityData,
  UpdateMetalPurityData,
} from '@/redux/services/metalPurityService'

// Metal Purity state interface
interface MetalPurityState {
  items: MetalPurity[]
  selectedItem: MetalPurity | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: MetalPurityState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all metal purities
export const fetchMetalPurities = createAsyncThunk(
  'metalPurity/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await metalPurityService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal purities'
      )
    }
  }
)

// Create metal purity
export const createMetalPurity = createAsyncThunk(
  'metalPurity/create',
  async (data: CreateMetalPurityData, { rejectWithValue }) => {
    try {
      const response = await metalPurityService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create metal purity'
      )
    }
  }
)

// Update metal purity
export const updateMetalPurity = createAsyncThunk(
  'metalPurity/update',
  async ({ id, data }: { id: string; data: UpdateMetalPurityData }, { rejectWithValue }) => {
    try {
      const response = await metalPurityService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update metal purity'
      )
    }
  }
)

// Create the metal purity slice
const metalPuritySlice = createSlice({
  name: 'metalPurity',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<MetalPurity | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metal purities cases
      .addCase(fetchMetalPurities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMetalPurities.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchMetalPurities.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch metal purities'
      })
      // Create metal purity cases
      .addCase(createMetalPurity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMetalPurity.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createMetalPurity.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create metal purity'
      })
      // Update metal purity cases
      .addCase(updateMetalPurity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMetalPurity.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateMetalPurity.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update metal purity'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = metalPuritySlice.actions

// Export reducer
export default metalPuritySlice.reducer
