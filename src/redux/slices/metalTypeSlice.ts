import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import metalTypeService, {
  MetalType,
  CreateMetalTypeData,
  UpdateMetalTypeData,
} from '@/redux/services/metalTypeService'

// Metal Type state interface
interface MetalTypeState {
  items: MetalType[]
  selectedItem: MetalType | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: MetalTypeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all metal types
export const fetchMetalTypes = createAsyncThunk(
  'metalType/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await metalTypeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal types'
      )
    }
  }
)

// Create metal type
export const createMetalType = createAsyncThunk(
  'metalType/create',
  async (data: CreateMetalTypeData, { rejectWithValue }) => {
    try {
      const response = await metalTypeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create metal type'
      )
    }
  }
)

// Update metal type
export const updateMetalType = createAsyncThunk(
  'metalType/update',
  async ({ id, data }: { id: string; data: UpdateMetalTypeData }, { rejectWithValue }) => {
    try {
      const response = await metalTypeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update metal type'
      )
    }
  }
)

// Create the metal type slice
const metalTypeSlice = createSlice({
  name: 'metalType',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<MetalType | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metal types cases
      .addCase(fetchMetalTypes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMetalTypes.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchMetalTypes.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch metal types'
      })
      // Create metal type cases
      .addCase(createMetalType.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMetalType.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createMetalType.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create metal type'
      })
      // Update metal type cases
      .addCase(updateMetalType.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMetalType.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateMetalType.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update metal type'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = metalTypeSlice.actions

// Export reducer
export default metalTypeSlice.reducer
