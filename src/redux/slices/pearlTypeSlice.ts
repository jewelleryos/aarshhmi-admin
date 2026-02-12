import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import pearlTypeService, {
  PearlType,
  CreatePearlTypeData,
  UpdatePearlTypeData,
} from '@/redux/services/pearlTypeService'

// Pearl Type state interface
interface PearlTypeState {
  items: PearlType[]
  selectedItem: PearlType | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: PearlTypeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all pearl types
export const fetchPearlTypes = createAsyncThunk(
  'pearlType/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pearlTypeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pearl types'
      )
    }
  }
)

// Create pearl type
export const createPearlType = createAsyncThunk(
  'pearlType/create',
  async (data: CreatePearlTypeData, { rejectWithValue }) => {
    try {
      const response = await pearlTypeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create pearl type'
      )
    }
  }
)

// Update pearl type
export const updatePearlType = createAsyncThunk(
  'pearlType/update',
  async ({ id, data }: { id: string; data: UpdatePearlTypeData }, { rejectWithValue }) => {
    try {
      const response = await pearlTypeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update pearl type'
      )
    }
  }
)

// Create the pearl type slice
const pearlTypeSlice = createSlice({
  name: 'pearlType',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<PearlType | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pearl types cases
      .addCase(fetchPearlTypes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPearlTypes.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchPearlTypes.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch pearl types'
      })
      // Create pearl type cases
      .addCase(createPearlType.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPearlType.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createPearlType.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create pearl type'
      })
      // Update pearl type cases
      .addCase(updatePearlType.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePearlType.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updatePearlType.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update pearl type'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = pearlTypeSlice.actions

// Export reducer
export default pearlTypeSlice.reducer
