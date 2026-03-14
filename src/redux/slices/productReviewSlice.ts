import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import productReviewService, {
  ProductReviewListItem,
  ProductReview,
  CreateProductReviewData,
  UpdateProductReviewData,
} from '@/redux/services/productReviewService'

interface ProductReviewState {
  items: ProductReviewListItem[]
  selectedItem: ProductReview | null
  isLoading: boolean
  error: string | null
}

const initialState: ProductReviewState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

export const fetchProductReviews = createAsyncThunk(
  'productReview/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productReviewService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch product reviews'
      )
    }
  }
)

export const createProductReview = createAsyncThunk(
  'productReview/create',
  async (data: CreateProductReviewData, { rejectWithValue }) => {
    try {
      const response = await productReviewService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create product review'
      )
    }
  }
)

export const updateProductReview = createAsyncThunk(
  'productReview/update',
  async ({ id, data }: { id: string; data: UpdateProductReviewData }, { rejectWithValue }) => {
    try {
      const response = await productReviewService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update product review'
      )
    }
  }
)

const productReviewSlice = createSlice({
  name: 'productReview',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedItem: (state, action: PayloadAction<ProductReview | null>) => {
      state.selectedItem = action.payload
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch product reviews'
      })
      .addCase(createProductReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create product review'
      })
      .addCase(updateProductReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProductReview.fulfilled, (state) => {
        state.isLoading = false
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateProductReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update product review'
      })
  },
})

export const { clearError, setSelectedItem, clearSelectedItem } = productReviewSlice.actions
export default productReviewSlice.reducer
