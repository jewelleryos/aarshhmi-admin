import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import priceRecalculationService from '../services/priceRecalculationService'
import type { RecalculationJob } from '../services/priceRecalculationService'

interface PriceRecalculationState {
  jobs: RecalculationJob[]
  isLoading: boolean
  isTriggering: boolean
  error: string | null
}

const initialState: PriceRecalculationState = {
  jobs: [],
  isLoading: false,
  isTriggering: false,
  error: null,
}

export const fetchJobs = createAsyncThunk(
  'priceRecalculation/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceRecalculationService.listJobs()
      return response.data.items
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs')
    }
  }
)

export const triggerRecalculation = createAsyncThunk(
  'priceRecalculation/trigger',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await priceRecalculationService.trigger()
      dispatch(fetchJobs())
      return null
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to trigger recalculation')
    }
  }
)

const priceRecalculationSlice = createSlice({
  name: 'priceRecalculation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(triggerRecalculation.pending, (state) => {
        state.isTriggering = true
        state.error = null
      })
      .addCase(triggerRecalculation.fulfilled, (state) => {
        state.isTriggering = false
      })
      .addCase(triggerRecalculation.rejected, (state, action) => {
        state.isTriggering = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = priceRecalculationSlice.actions
export default priceRecalculationSlice.reducer
