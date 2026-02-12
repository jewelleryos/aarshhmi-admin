import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import stoneShapeService, {
  StoneShape,
  CreateStoneShapeData,
  UpdateStoneShapeData,
} from '@/redux/services/stoneShapeService'

// Stone Shape state interface
interface StoneShapeState {
  items: StoneShape[]
  selectedItem: StoneShape | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: StoneShapeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all stone shapes
export const fetchStoneShapes = createAsyncThunk(
  'stoneShape/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stoneShapeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch stone shapes'
      )
    }
  }
)

// Create stone shape
export const createStoneShape = createAsyncThunk(
  'stoneShape/create',
  async (data: CreateStoneShapeData, { rejectWithValue }) => {
    try {
      const response = await stoneShapeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create stone shape'
      )
    }
  }
)

// Update stone shape
export const updateStoneShape = createAsyncThunk(
  'stoneShape/update',
  async ({ id, data }: { id: string; data: UpdateStoneShapeData }, { rejectWithValue }) => {
    try {
      const response = await stoneShapeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update stone shape'
      )
    }
  }
)

// Create the stone shape slice
const stoneShapeSlice = createSlice({
  name: 'stoneShape',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<StoneShape | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stone shapes cases
      .addCase(fetchStoneShapes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStoneShapes.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchStoneShapes.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch stone shapes'
      })
      // Create stone shape cases
      .addCase(createStoneShape.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createStoneShape.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createStoneShape.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create stone shape'
      })
      // Update stone shape cases
      .addCase(updateStoneShape.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStoneShape.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateStoneShape.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update stone shape'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = stoneShapeSlice.actions

// Export reducer
export default stoneShapeSlice.reducer
