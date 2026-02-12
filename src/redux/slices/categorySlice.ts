import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import categoryService, {
  Category,
  CategoryWithChildren,
  FlattenedCategory,
  CreateCategoryData,
  UpdateCategoryData,
  UpdateCategorySeoData,
} from '@/redux/services/categoryService'

// Helper function to flatten hierarchical categories for table display
function flattenCategories(categories: CategoryWithChildren[]): FlattenedCategory[] {
  const result: FlattenedCategory[] = []

  categories.forEach((category) => {
    // Add root category
    result.push({
      ...category,
      level: 0,
      hasChildren: category.children.length > 0,
    })

    // Add children immediately after parent
    category.children.forEach((child) => {
      result.push({
        ...child,
        level: 1,
        hasChildren: false,
      })
    })
  })

  return result
}

// Category state interface
interface CategoryState {
  items: CategoryWithChildren[] // Hierarchical data from API
  flattenedItems: FlattenedCategory[] // Flattened for table display
  flatItems: Category[] // Flat list for dropdowns
  selectedItem: Category | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: CategoryState = {
  items: [],
  flattenedItems: [],
  flatItems: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all categories (hierarchical)
export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      )
    }
  }
)

// Fetch all categories (flat - for dropdowns)
export const fetchCategoriesFlat = createAsyncThunk(
  'category/fetchFlat',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.listFlat()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      )
    }
  }
)

// Create category
export const createCategory = createAsyncThunk(
  'category/create',
  async (data: CreateCategoryData, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create category'
      )
    }
  }
)

// Update category
export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, data }: { id: string; data: UpdateCategoryData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update category'
      )
    }
  }
)

// Update category SEO
export const updateCategorySeo = createAsyncThunk(
  'category/updateSeo',
  async ({ id, data }: { id: string; data: UpdateCategorySeoData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateSeo(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update category SEO'
      )
    }
  }
)

// Create the category slice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<Category | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories (hierarchical) cases
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.flattenedItems = flattenCategories(action.payload)
        state.error = null
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch categories'
      })
      // Fetch categories (flat) cases
      .addCase(fetchCategoriesFlat.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoriesFlat.fulfilled, (state, action) => {
        state.isLoading = false
        state.flatItems = action.payload
        state.error = null
      })
      .addCase(fetchCategoriesFlat.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch categories'
      })
      // Create category cases - refetch to get proper hierarchy
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
        // Note: We'll refetch the list to maintain proper hierarchy
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create category'
      })
      // Update category cases - refetch to get proper hierarchy
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.isLoading = false
        state.selectedItem = null
        state.error = null
        // Note: We'll refetch the list to maintain proper hierarchy
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update category'
      })
      // Update category SEO cases - refetch to get proper hierarchy
      .addCase(updateCategorySeo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategorySeo.fulfilled, (state) => {
        state.isLoading = false
        state.selectedItem = null
        state.error = null
        // Note: We'll refetch the list to maintain proper hierarchy
      })
      .addCase(updateCategorySeo.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update category SEO'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = categorySlice.actions

// Export reducer
export default categorySlice.reducer
