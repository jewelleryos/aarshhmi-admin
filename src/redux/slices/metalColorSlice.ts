import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import metalColorService, {
  MetalColor,
  CreateMetalColorData,
  UpdateMetalColorData,
} from '@/redux/services/metalColorService'

// Metal Color state interface
interface MetalColorState {
  items: MetalColor[]
  selectedItem: MetalColor | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: MetalColorState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all metal colors
export const fetchMetalColors = createAsyncThunk(
  'metalColor/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await metalColorService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal colors'
      )
    }
  }
)

// Create metal color
export const createMetalColor = createAsyncThunk(
  'metalColor/create',
  async (data: CreateMetalColorData, { rejectWithValue }) => {
    try {
      const response = await metalColorService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create metal color'
      )
    }
  }
)

// Update metal color
export const updateMetalColor = createAsyncThunk(
  'metalColor/update',
  async ({ id, data }: { id: string; data: UpdateMetalColorData }, { rejectWithValue }) => {
    try {
      const response = await metalColorService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update metal color'
      )
    }
  }
)

// Create the metal color slice
const metalColorSlice = createSlice({
  name: 'metalColor',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<MetalColor | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metal colors cases
      .addCase(fetchMetalColors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMetalColors.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchMetalColors.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch metal colors'
      })
      // Create metal color cases
      .addCase(createMetalColor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMetalColor.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createMetalColor.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create metal color'
      })
      // Update metal color cases
      .addCase(updateMetalColor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMetalColor.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateMetalColor.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update metal color'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = metalColorSlice.actions

// Export reducer
export default metalColorSlice.reducer
