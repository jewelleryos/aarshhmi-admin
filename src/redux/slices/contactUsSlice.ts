import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import contactUsService, { ContactInquiryListItem } from '@/redux/services/contactUsService'

interface ContactUsState {
  items: ContactInquiryListItem[]
  total: number
  isLoading: boolean
  error: string | null
}

const initialState: ContactUsState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
}

export const fetchContactInquiries = createAsyncThunk(
  'contactUs/fetchContactInquiries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactUsService.list()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact inquiries')
    }
  }
)

const contactUsSlice = createSlice({
  name: 'contactUs',
  initialState,
  reducers: {
    clearContactInquiries: (state) => {
      state.items = []
      state.total = 0
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactInquiries.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchContactInquiries.fulfilled,
        (state, action: PayloadAction<{ items: ContactInquiryListItem[]; total: number }>) => {
          state.isLoading = false
          state.items = action.payload.items
          state.total = action.payload.total
        }
      )
      .addCase(fetchContactInquiries.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearContactInquiries } = contactUsSlice.actions
export default contactUsSlice.reducer
