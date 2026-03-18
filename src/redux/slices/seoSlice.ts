import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import seoService, { SEOListItem, SeoPageUpdateRequest } from '@/redux/services/seoService'

interface SeoFormData {
    pageName: string
    metaTitle: string
    metaKeywords: string
    metaDescription: string
    metaRobots: string
    metaCanonical: string
    ogTitle: string
    ogSiteName: string
    ogDescription: string
    ogUrl: string
    ogImageUrl: string
    twitterTitle: string
    twitterSiteName: string
    twitterDescription: string
    twitterUrl: string
    twitterMedia: string
}

interface SeoState {
    pages: SEOListItem[]
    isLoading: boolean
    isUpdating: boolean
    error: string | null
    formData: SeoFormData
}

const initialFormData: SeoFormData = {
    pageName: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
    metaRobots: '',
    metaCanonical: '',
    ogTitle: '',
    ogSiteName: '',
    ogDescription: '',
    ogUrl: '',
    ogImageUrl: '',
    twitterTitle: '',
    twitterSiteName: '',
    twitterDescription: '',
    twitterUrl: '',
    twitterMedia: '',
}

const initialState: SeoState = {
    pages: [],
    isLoading: false,
    isUpdating: false,
    error: null,
    formData: initialFormData,
}

// Fetch SEO pages async thunk
export const fetchSeoPages = createAsyncThunk(
    'seo/fetchSeoPages',
    async (_, { rejectWithValue }) => {
        try {
            const response = await seoService.getList()
            if (response.success) {
                return response.data.items
            }
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch SEO pages'
            )
        }
    }
)

// Update SEO page async thunk
export const updateSeoPage = createAsyncThunk(
    'seo/updateSeoPage',
    async ({ id, data }: { id: string; data: SeoPageUpdateRequest }, { rejectWithValue }) => {
        try {
            const response = await seoService.update(id, data)
            if (response.success) {
                return { data: response.data, message: response.message }
            }
            return rejectWithValue(response.message || 'Failed to update SEO page')
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update SEO page'
            )
        }
    }
)

const seoSlice = createSlice({
    name: 'seo',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setFormData: (state, action: PayloadAction<Partial<SeoFormData>>) => {
            state.formData = { ...state.formData, ...action.payload }
        },
        resetFormData: (state) => {
            state.formData = initialFormData
        },
        initializeFormData: (state, action: PayloadAction<SEOListItem>) => {
            const data = action.payload
            state.formData = {
                pageName: data.name || '',
                metaTitle: data.seo_data?.title || '',
                metaKeywords: data.seo_data?.keywords?.join(", ") || '',
                metaDescription: data.seo_data?.description || '',
                metaRobots: data.seo_data?.robots || '',
                metaCanonical: data.seo_data?.canonical_url || '',
                ogTitle: data.seo_data?.og_title || '',
                ogSiteName: data.seo_data?.og_site_name || '',
                ogDescription: data.seo_data?.og_description || '',
                ogUrl: data.seo_data?.og_url || '',
                ogImageUrl: data.seo_data?.og_image || '',
                twitterTitle: data.seo_data?.twitter_title || '',
                twitterSiteName: data.seo_data?.twitter_site || '',
                twitterDescription: data.seo_data?.twitter_description || '',
                twitterUrl: data.seo_data?.twitter_url || '',
                twitterMedia: data.seo_data?.twitter_image || '',
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSeoPages.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchSeoPages.fulfilled, (state, action) => {
                state.isLoading = false
                state.pages = action.payload || []
                state.error = null
            })
            .addCase(fetchSeoPages.rejected, (state, action) => {
                state.isLoading = false
                state.error = (action.payload as string) || 'Failed to fetch SEO pages'
            })
            // Update SEO page
            .addCase(updateSeoPage.pending, (state) => {
                state.isUpdating = true
                state.error = null
            })
            .addCase(updateSeoPage.fulfilled, (state, action) => {
                state.isUpdating = false
                state.error = null
                if (action.payload?.data) {
                    const index = state.pages.findIndex((p) => p.id === action.payload.data.id)
                    if (index !== -1) {
                        state.pages[index] = { ...state.pages[index], ...action.payload.data }
                    }
                }
            })
            .addCase(updateSeoPage.rejected, (state, action) => {
                state.isUpdating = false
                state.error = (action.payload as string) || 'Failed to update SEO page'
            })
    },
})

export const { clearError, setFormData, resetFormData, initializeFormData } = seoSlice.actions
export default seoSlice.reducer
