import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import gemstoneTypeService, {
  GemstoneType,
  CreateGemstoneTypeData,
  UpdateGemstoneTypeData,
} from '@/redux/services/gemstoneTypeService'

// Gemstone Type state interface
interface GemstoneTypeState {
  items: GemstoneType[]
  selectedItem: GemstoneType | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: GemstoneTypeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all gemstone types
export const fetchGemstoneTypes = createAsyncThunk(
  'gemstoneType/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gemstoneTypeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone types'
      )
    }
  }
)

// Create gemstone type
export const createGemstoneType = createAsyncThunk(
  'gemstoneType/create',
  async (data: CreateGemstoneTypeData, { rejectWithValue }) => {
    try {
      const response = await gemstoneTypeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create gemstone type'
      )
    }
  }
)

// Update gemstone type
export const updateGemstoneType = createAsyncThunk(
  'gemstoneType/update',
  async ({ id, data }: { id: string; data: UpdateGemstoneTypeData }, { rejectWithValue }) => {
    try {
      const response = await gemstoneTypeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update gemstone type'
      )
    }
  }
)

// Create the gemstone type slice
const gemstoneTypeSlice = createSlice({
  name: 'gemstoneType',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<GemstoneType | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gemstone types cases
      .addCase(fetchGemstoneTypes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGemstoneTypes.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchGemstoneTypes.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone types'
      })
      // Create gemstone type cases
      .addCase(createGemstoneType.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGemstoneType.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createGemstoneType.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create gemstone type'
      })
      // Update gemstone type cases
      .addCase(updateGemstoneType.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateGemstoneType.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateGemstoneType.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update gemstone type'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = gemstoneTypeSlice.actions

// Export reducer
export default gemstoneTypeSlice.reducer
