import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import gemstoneColorService, {
  GemstoneColor,
  CreateGemstoneColorData,
  UpdateGemstoneColorData,
} from '@/redux/services/gemstoneColorService'

// Gemstone Color state interface
interface GemstoneColorState {
  items: GemstoneColor[]
  selectedItem: GemstoneColor | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: GemstoneColorState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all gemstone colors
export const fetchGemstoneColors = createAsyncThunk(
  'gemstoneColor/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gemstoneColorService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone colors'
      )
    }
  }
)

// Create gemstone color
export const createGemstoneColor = createAsyncThunk(
  'gemstoneColor/create',
  async (data: CreateGemstoneColorData, { rejectWithValue }) => {
    try {
      const response = await gemstoneColorService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create gemstone color'
      )
    }
  }
)

// Update gemstone color
export const updateGemstoneColor = createAsyncThunk(
  'gemstoneColor/update',
  async ({ id, data }: { id: string; data: UpdateGemstoneColorData }, { rejectWithValue }) => {
    try {
      const response = await gemstoneColorService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update gemstone color'
      )
    }
  }
)

// Create the gemstone color slice
const gemstoneColorSlice = createSlice({
  name: 'gemstoneColor',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<GemstoneColor | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gemstone colors cases
      .addCase(fetchGemstoneColors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGemstoneColors.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchGemstoneColors.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone colors'
      })
      // Create gemstone color cases
      .addCase(createGemstoneColor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGemstoneColor.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createGemstoneColor.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create gemstone color'
      })
      // Update gemstone color cases
      .addCase(updateGemstoneColor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateGemstoneColor.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateGemstoneColor.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update gemstone color'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = gemstoneColorSlice.actions

// Export reducer
export default gemstoneColorSlice.reducer
