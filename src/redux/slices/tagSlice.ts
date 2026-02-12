import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import tagService, {
  Tag,
  CreateTagData,
  UpdateTagData,
  UpdateTagSeoData,
} from '@/redux/services/tagService'

// Tag state interface
interface TagState {
  items: Tag[]
  selectedItem: Tag | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: TagState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all tags (with optional group filter)
export const fetchTags = createAsyncThunk(
  'tag/fetchAll',
  async (tagGroupId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await tagService.list(tagGroupId)
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tags'
      )
    }
  }
)

// Create tag
export const createTag = createAsyncThunk(
  'tag/create',
  async (data: CreateTagData, { rejectWithValue }) => {
    try {
      const response = await tagService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create tag'
      )
    }
  }
)

// Update tag
export const updateTag = createAsyncThunk(
  'tag/update',
  async ({ id, data }: { id: string; data: UpdateTagData }, { rejectWithValue }) => {
    try {
      const response = await tagService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update tag'
      )
    }
  }
)

// Update tag SEO
export const updateTagSeo = createAsyncThunk(
  'tag/updateSeo',
  async ({ id, data }: { id: string; data: UpdateTagSeoData }, { rejectWithValue }) => {
    try {
      const response = await tagService.updateSeo(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update tag SEO'
      )
    }
  }
)

// Create the tag slice
const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<Tag | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tags cases
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch tags'
      })
      // Create tag cases
      .addCase(createTag.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createTag.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create tag'
      })
      // Update tag cases
      .addCase(updateTag.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update tag'
      })
      // Update tag SEO cases
      .addCase(updateTagSeo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTagSeo.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateTagSeo.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update tag SEO'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = tagSlice.actions

// Export reducer
export default tagSlice.reducer
