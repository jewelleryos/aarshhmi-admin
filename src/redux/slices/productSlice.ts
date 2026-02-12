import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService, {
  SizeChartGroupDropdownItem,
  MetalTypeDropdownItem,
  MetalColorDropdownItem,
  MetalPurityDropdownItem,
  StoneShapeDropdownItem,
  DiamondClarityColorDropdownItem,
  DiamondPricingDropdownItem,
  GemstoneTypeDropdownItem,
  GemstoneQualityDropdownItem,
  GemstoneColorDropdownItem,
  GemstonePricingDropdownItem,
  PearlTypeDropdownItem,
  PearlQualityDropdownItem,
  BadgeDropdownItem,
  CategoryDropdownItem,
  TagGroupDropdownItem,
  TagDropdownItem,
} from '@/redux/services/productService'

// Product state interface
interface ProductState {
  // Dropdown data - Metal
  sizeChartGroups: SizeChartGroupDropdownItem[]
  metalTypes: MetalTypeDropdownItem[]
  metalColors: MetalColorDropdownItem[]
  metalPurities: MetalPurityDropdownItem[]
  // Dropdown data - Stone
  stoneShapes: StoneShapeDropdownItem[]
  diamondClarityColors: DiamondClarityColorDropdownItem[]
  diamondPricings: DiamondPricingDropdownItem[]
  gemstoneTypes: GemstoneTypeDropdownItem[]
  gemstoneQualities: GemstoneQualityDropdownItem[]
  gemstoneColors: GemstoneColorDropdownItem[]
  gemstonePricings: GemstonePricingDropdownItem[]
  pearlTypes: PearlTypeDropdownItem[]
  pearlQualities: PearlQualityDropdownItem[]
  // Dropdown data - Attributes
  badges: BadgeDropdownItem[]
  categories: CategoryDropdownItem[]
  tagGroups: TagGroupDropdownItem[]
  tags: TagDropdownItem[]
  // Loading states - Metal
  isLoadingSizeChartGroups: boolean
  isLoadingMetalTypes: boolean
  isLoadingMetalColors: boolean
  isLoadingMetalPurities: boolean
  // Loading states - Stone
  isLoadingStoneShapes: boolean
  isLoadingDiamondClarityColors: boolean
  isLoadingDiamondPricings: boolean
  isLoadingGemstoneTypes: boolean
  isLoadingGemstoneQualities: boolean
  isLoadingGemstoneColors: boolean
  isLoadingGemstonePricings: boolean
  isLoadingPearlTypes: boolean
  isLoadingPearlQualities: boolean
  // Loading states - Attributes
  isLoadingBadges: boolean
  isLoadingCategories: boolean
  isLoadingTagGroups: boolean
  isLoadingTags: boolean
  // Error states
  error: string | null
}

// Initial state
const initialState: ProductState = {
  // Metal
  sizeChartGroups: [],
  metalTypes: [],
  metalColors: [],
  metalPurities: [],
  // Stone
  stoneShapes: [],
  diamondClarityColors: [],
  diamondPricings: [],
  gemstoneTypes: [],
  gemstoneQualities: [],
  gemstoneColors: [],
  gemstonePricings: [],
  pearlTypes: [],
  pearlQualities: [],
  // Attributes
  badges: [],
  categories: [],
  tagGroups: [],
  tags: [],
  // Loading - Metal
  isLoadingSizeChartGroups: false,
  isLoadingMetalTypes: false,
  isLoadingMetalColors: false,
  isLoadingMetalPurities: false,
  // Loading - Stone
  isLoadingStoneShapes: false,
  isLoadingDiamondClarityColors: false,
  isLoadingDiamondPricings: false,
  isLoadingGemstoneTypes: false,
  isLoadingGemstoneQualities: false,
  isLoadingGemstoneColors: false,
  isLoadingGemstonePricings: false,
  isLoadingPearlTypes: false,
  isLoadingPearlQualities: false,
  // Loading - Attributes
  isLoadingBadges: false,
  isLoadingCategories: false,
  isLoadingTagGroups: false,
  isLoadingTags: false,
  error: null,
}

// Fetch size chart groups for product dropdown (create)
export const fetchSizeChartGroupsForProduct = createAsyncThunk(
  'product/fetchSizeChartGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getSizeChartGroups()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch size chart groups'
      )
    }
  }
)

// Fetch size chart groups for product edit dropdown
export const fetchSizeChartGroupsForProductEdit = createAsyncThunk(
  'product/fetchSizeChartGroupsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getSizeChartGroupsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch size chart groups'
      )
    }
  }
)

// Fetch metal types for product dropdown
export const fetchMetalTypesForProduct = createAsyncThunk(
  'product/fetchMetalTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMetalTypes()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal types'
      )
    }
  }
)

// Fetch metal colors for product dropdown
export const fetchMetalColorsForProduct = createAsyncThunk(
  'product/fetchMetalColors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMetalColors()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal colors'
      )
    }
  }
)

// Fetch metal purities for product dropdown
export const fetchMetalPuritiesForProduct = createAsyncThunk(
  'product/fetchMetalPurities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMetalPurities()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal purities'
      )
    }
  }
)

// Fetch stone shapes for product dropdown
export const fetchStoneShapesForProduct = createAsyncThunk(
  'product/fetchStoneShapes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getStoneShapes()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch stone shapes'
      )
    }
  }
)

// Fetch diamond clarity colors for product dropdown
export const fetchDiamondClarityColorsForProduct = createAsyncThunk(
  'product/fetchDiamondClarityColors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getDiamondClarityColors()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch diamond clarity colors'
      )
    }
  }
)

// Fetch diamond pricings for product dropdown
export const fetchDiamondPricingsForProduct = createAsyncThunk(
  'product/fetchDiamondPricings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getDiamondPricings()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch diamond pricings'
      )
    }
  }
)

// Fetch gemstone types for product dropdown
export const fetchGemstoneTypesForProduct = createAsyncThunk(
  'product/fetchGemstoneTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstoneTypes()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone types'
      )
    }
  }
)

// Fetch gemstone qualities for product dropdown
export const fetchGemstoneQualitiesForProduct = createAsyncThunk(
  'product/fetchGemstoneQualities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstoneQualities()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone qualities'
      )
    }
  }
)

// Fetch gemstone colors for product dropdown
export const fetchGemstoneColorsForProduct = createAsyncThunk(
  'product/fetchGemstoneColors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstoneColors()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone colors'
      )
    }
  }
)

// Fetch gemstone pricings for product dropdown
export const fetchGemstonePricingsForProduct = createAsyncThunk(
  'product/fetchGemstonePricings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstonePricings()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone pricings'
      )
    }
  }
)

// Fetch pearl types for product dropdown
export const fetchPearlTypesForProduct = createAsyncThunk(
  'product/fetchPearlTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getPearlTypes()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pearl types'
      )
    }
  }
)

// Fetch pearl qualities for product dropdown
export const fetchPearlQualitiesForProduct = createAsyncThunk(
  'product/fetchPearlQualities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getPearlQualities()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pearl qualities'
      )
    }
  }
)

// Fetch badges for product dropdown
export const fetchBadgesForProduct = createAsyncThunk(
  'product/fetchBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getBadges()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch badges'
      )
    }
  }
)

// Fetch categories for product dropdown
export const fetchCategoriesForProduct = createAsyncThunk(
  'product/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      )
    }
  }
)

// Fetch tag groups for product dropdown
export const fetchTagGroupsForProduct = createAsyncThunk(
  'product/fetchTagGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getTagGroups()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tag groups'
      )
    }
  }
)

// Fetch tags for product dropdown
export const fetchTagsForProduct = createAsyncThunk(
  'product/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getTags()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tags'
      )
    }
  }
)

// Fetch badges for product edit dropdown
export const fetchBadgesForProductEdit = createAsyncThunk(
  'product/fetchBadgesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getBadgesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch badges'
      )
    }
  }
)

// Fetch categories for product edit dropdown
export const fetchCategoriesForProductEdit = createAsyncThunk(
  'product/fetchCategoriesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategoriesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      )
    }
  }
)

// Fetch tag groups for product edit dropdown
export const fetchTagGroupsForProductEdit = createAsyncThunk(
  'product/fetchTagGroupsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getTagGroupsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tag groups'
      )
    }
  }
)

// Fetch tags for product edit dropdown
export const fetchTagsForProductEdit = createAsyncThunk(
  'product/fetchTagsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getTagsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tags'
      )
    }
  }
)

// ========== OPTIONS EDIT FETCHERS (PRODUCT.UPDATE permission) ==========

// Fetch metal types for product options edit
export const fetchMetalTypesForProductEdit = createAsyncThunk(
  'product/fetchMetalTypesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMetalTypesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal types'
      )
    }
  }
)

// Fetch metal colors for product options edit
export const fetchMetalColorsForProductEdit = createAsyncThunk(
  'product/fetchMetalColorsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMetalColorsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal colors'
      )
    }
  }
)

// Fetch metal purities for product options edit
export const fetchMetalPuritiesForProductEdit = createAsyncThunk(
  'product/fetchMetalPuritiesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMetalPuritiesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch metal purities'
      )
    }
  }
)

// Fetch stone shapes for product options edit
export const fetchStoneShapesForProductEdit = createAsyncThunk(
  'product/fetchStoneShapesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getStoneShapesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch stone shapes'
      )
    }
  }
)

// Fetch diamond clarity colors for product options edit
export const fetchDiamondClarityColorsForProductEdit = createAsyncThunk(
  'product/fetchDiamondClarityColorsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getDiamondClarityColorsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch diamond clarity colors'
      )
    }
  }
)

// Fetch diamond pricings for product options edit
export const fetchDiamondPricingsForProductEdit = createAsyncThunk(
  'product/fetchDiamondPricingsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getDiamondPricingsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch diamond pricings'
      )
    }
  }
)

// Fetch gemstone types for product options edit
export const fetchGemstoneTypesForProductEdit = createAsyncThunk(
  'product/fetchGemstoneTypesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstoneTypesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone types'
      )
    }
  }
)

// Fetch gemstone qualities for product options edit
export const fetchGemstoneQualitiesForProductEdit = createAsyncThunk(
  'product/fetchGemstoneQualitiesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstoneQualitiesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone qualities'
      )
    }
  }
)

// Fetch gemstone colors for product options edit
export const fetchGemstoneColorsForProductEdit = createAsyncThunk(
  'product/fetchGemstoneColorsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstoneColorsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone colors'
      )
    }
  }
)

// Fetch gemstone pricings for product options edit
export const fetchGemstonePricingsForProductEdit = createAsyncThunk(
  'product/fetchGemstonePricingsForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getGemstonePricingsForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch gemstone pricings'
      )
    }
  }
)

// Fetch pearl types for product options edit
export const fetchPearlTypesForProductEdit = createAsyncThunk(
  'product/fetchPearlTypesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getPearlTypesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pearl types'
      )
    }
  }
)

// Fetch pearl qualities for product options edit
export const fetchPearlQualitiesForProductEdit = createAsyncThunk(
  'product/fetchPearlQualitiesForEdit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getPearlQualitiesForEdit()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pearl qualities'
      )
    }
  }
)

// Create the product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Size chart groups
      .addCase(fetchSizeChartGroupsForProduct.pending, (state) => {
        state.isLoadingSizeChartGroups = true
        state.error = null
      })
      .addCase(fetchSizeChartGroupsForProduct.fulfilled, (state, action) => {
        state.isLoadingSizeChartGroups = false
        state.sizeChartGroups = action.payload
      })
      .addCase(fetchSizeChartGroupsForProduct.rejected, (state, action) => {
        state.isLoadingSizeChartGroups = false
        state.error = (action.payload as string) || 'Failed to fetch size chart groups'
      })
      // Size chart groups for edit (reuses same state)
      .addCase(fetchSizeChartGroupsForProductEdit.pending, (state) => {
        state.isLoadingSizeChartGroups = true
        state.error = null
      })
      .addCase(fetchSizeChartGroupsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingSizeChartGroups = false
        state.sizeChartGroups = action.payload
      })
      .addCase(fetchSizeChartGroupsForProductEdit.rejected, (state, action) => {
        state.isLoadingSizeChartGroups = false
        state.error = (action.payload as string) || 'Failed to fetch size chart groups'
      })
      // Metal types
      .addCase(fetchMetalTypesForProduct.pending, (state) => {
        state.isLoadingMetalTypes = true
        state.error = null
      })
      .addCase(fetchMetalTypesForProduct.fulfilled, (state, action) => {
        state.isLoadingMetalTypes = false
        state.metalTypes = action.payload
      })
      .addCase(fetchMetalTypesForProduct.rejected, (state, action) => {
        state.isLoadingMetalTypes = false
        state.error = (action.payload as string) || 'Failed to fetch metal types'
      })
      // Metal colors
      .addCase(fetchMetalColorsForProduct.pending, (state) => {
        state.isLoadingMetalColors = true
        state.error = null
      })
      .addCase(fetchMetalColorsForProduct.fulfilled, (state, action) => {
        state.isLoadingMetalColors = false
        state.metalColors = action.payload
      })
      .addCase(fetchMetalColorsForProduct.rejected, (state, action) => {
        state.isLoadingMetalColors = false
        state.error = (action.payload as string) || 'Failed to fetch metal colors'
      })
      // Metal purities
      .addCase(fetchMetalPuritiesForProduct.pending, (state) => {
        state.isLoadingMetalPurities = true
        state.error = null
      })
      .addCase(fetchMetalPuritiesForProduct.fulfilled, (state, action) => {
        state.isLoadingMetalPurities = false
        state.metalPurities = action.payload
      })
      .addCase(fetchMetalPuritiesForProduct.rejected, (state, action) => {
        state.isLoadingMetalPurities = false
        state.error = (action.payload as string) || 'Failed to fetch metal purities'
      })
      // Stone shapes
      .addCase(fetchStoneShapesForProduct.pending, (state) => {
        state.isLoadingStoneShapes = true
        state.error = null
      })
      .addCase(fetchStoneShapesForProduct.fulfilled, (state, action) => {
        state.isLoadingStoneShapes = false
        state.stoneShapes = action.payload
      })
      .addCase(fetchStoneShapesForProduct.rejected, (state, action) => {
        state.isLoadingStoneShapes = false
        state.error = (action.payload as string) || 'Failed to fetch stone shapes'
      })
      // Diamond clarity colors
      .addCase(fetchDiamondClarityColorsForProduct.pending, (state) => {
        state.isLoadingDiamondClarityColors = true
        state.error = null
      })
      .addCase(fetchDiamondClarityColorsForProduct.fulfilled, (state, action) => {
        state.isLoadingDiamondClarityColors = false
        state.diamondClarityColors = action.payload
      })
      .addCase(fetchDiamondClarityColorsForProduct.rejected, (state, action) => {
        state.isLoadingDiamondClarityColors = false
        state.error = (action.payload as string) || 'Failed to fetch diamond clarity colors'
      })
      // Diamond pricings
      .addCase(fetchDiamondPricingsForProduct.pending, (state) => {
        state.isLoadingDiamondPricings = true
        state.error = null
      })
      .addCase(fetchDiamondPricingsForProduct.fulfilled, (state, action) => {
        state.isLoadingDiamondPricings = false
        state.diamondPricings = action.payload
      })
      .addCase(fetchDiamondPricingsForProduct.rejected, (state, action) => {
        state.isLoadingDiamondPricings = false
        state.error = (action.payload as string) || 'Failed to fetch diamond pricings'
      })
      // Gemstone types
      .addCase(fetchGemstoneTypesForProduct.pending, (state) => {
        state.isLoadingGemstoneTypes = true
        state.error = null
      })
      .addCase(fetchGemstoneTypesForProduct.fulfilled, (state, action) => {
        state.isLoadingGemstoneTypes = false
        state.gemstoneTypes = action.payload
      })
      .addCase(fetchGemstoneTypesForProduct.rejected, (state, action) => {
        state.isLoadingGemstoneTypes = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone types'
      })
      // Gemstone qualities
      .addCase(fetchGemstoneQualitiesForProduct.pending, (state) => {
        state.isLoadingGemstoneQualities = true
        state.error = null
      })
      .addCase(fetchGemstoneQualitiesForProduct.fulfilled, (state, action) => {
        state.isLoadingGemstoneQualities = false
        state.gemstoneQualities = action.payload
      })
      .addCase(fetchGemstoneQualitiesForProduct.rejected, (state, action) => {
        state.isLoadingGemstoneQualities = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone qualities'
      })
      // Gemstone colors
      .addCase(fetchGemstoneColorsForProduct.pending, (state) => {
        state.isLoadingGemstoneColors = true
        state.error = null
      })
      .addCase(fetchGemstoneColorsForProduct.fulfilled, (state, action) => {
        state.isLoadingGemstoneColors = false
        state.gemstoneColors = action.payload
      })
      .addCase(fetchGemstoneColorsForProduct.rejected, (state, action) => {
        state.isLoadingGemstoneColors = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone colors'
      })
      // Gemstone pricings
      .addCase(fetchGemstonePricingsForProduct.pending, (state) => {
        state.isLoadingGemstonePricings = true
        state.error = null
      })
      .addCase(fetchGemstonePricingsForProduct.fulfilled, (state, action) => {
        state.isLoadingGemstonePricings = false
        state.gemstonePricings = action.payload
      })
      .addCase(fetchGemstonePricingsForProduct.rejected, (state, action) => {
        state.isLoadingGemstonePricings = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone pricings'
      })
      // Pearl types
      .addCase(fetchPearlTypesForProduct.pending, (state) => {
        state.isLoadingPearlTypes = true
        state.error = null
      })
      .addCase(fetchPearlTypesForProduct.fulfilled, (state, action) => {
        state.isLoadingPearlTypes = false
        state.pearlTypes = action.payload
      })
      .addCase(fetchPearlTypesForProduct.rejected, (state, action) => {
        state.isLoadingPearlTypes = false
        state.error = (action.payload as string) || 'Failed to fetch pearl types'
      })
      // Pearl qualities
      .addCase(fetchPearlQualitiesForProduct.pending, (state) => {
        state.isLoadingPearlQualities = true
        state.error = null
      })
      .addCase(fetchPearlQualitiesForProduct.fulfilled, (state, action) => {
        state.isLoadingPearlQualities = false
        state.pearlQualities = action.payload
      })
      .addCase(fetchPearlQualitiesForProduct.rejected, (state, action) => {
        state.isLoadingPearlQualities = false
        state.error = (action.payload as string) || 'Failed to fetch pearl qualities'
      })
      // Badges
      .addCase(fetchBadgesForProduct.pending, (state) => {
        state.isLoadingBadges = true
        state.error = null
      })
      .addCase(fetchBadgesForProduct.fulfilled, (state, action) => {
        state.isLoadingBadges = false
        state.badges = action.payload
      })
      .addCase(fetchBadgesForProduct.rejected, (state, action) => {
        state.isLoadingBadges = false
        state.error = (action.payload as string) || 'Failed to fetch badges'
      })
      // Categories
      .addCase(fetchCategoriesForProduct.pending, (state) => {
        state.isLoadingCategories = true
        state.error = null
      })
      .addCase(fetchCategoriesForProduct.fulfilled, (state, action) => {
        state.isLoadingCategories = false
        state.categories = action.payload
      })
      .addCase(fetchCategoriesForProduct.rejected, (state, action) => {
        state.isLoadingCategories = false
        state.error = (action.payload as string) || 'Failed to fetch categories'
      })
      // Tag Groups
      .addCase(fetchTagGroupsForProduct.pending, (state) => {
        state.isLoadingTagGroups = true
        state.error = null
      })
      .addCase(fetchTagGroupsForProduct.fulfilled, (state, action) => {
        state.isLoadingTagGroups = false
        state.tagGroups = action.payload
      })
      .addCase(fetchTagGroupsForProduct.rejected, (state, action) => {
        state.isLoadingTagGroups = false
        state.error = (action.payload as string) || 'Failed to fetch tag groups'
      })
      // Tags
      .addCase(fetchTagsForProduct.pending, (state) => {
        state.isLoadingTags = true
        state.error = null
      })
      .addCase(fetchTagsForProduct.fulfilled, (state, action) => {
        state.isLoadingTags = false
        state.tags = action.payload
      })
      .addCase(fetchTagsForProduct.rejected, (state, action) => {
        state.isLoadingTags = false
        state.error = (action.payload as string) || 'Failed to fetch tags'
      })
      // Badges for edit (reuses same state)
      .addCase(fetchBadgesForProductEdit.pending, (state) => {
        state.isLoadingBadges = true
        state.error = null
      })
      .addCase(fetchBadgesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingBadges = false
        state.badges = action.payload
      })
      .addCase(fetchBadgesForProductEdit.rejected, (state, action) => {
        state.isLoadingBadges = false
        state.error = (action.payload as string) || 'Failed to fetch badges'
      })
      // Categories for edit (reuses same state)
      .addCase(fetchCategoriesForProductEdit.pending, (state) => {
        state.isLoadingCategories = true
        state.error = null
      })
      .addCase(fetchCategoriesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingCategories = false
        state.categories = action.payload
      })
      .addCase(fetchCategoriesForProductEdit.rejected, (state, action) => {
        state.isLoadingCategories = false
        state.error = (action.payload as string) || 'Failed to fetch categories'
      })
      // Tag groups for edit (reuses same state)
      .addCase(fetchTagGroupsForProductEdit.pending, (state) => {
        state.isLoadingTagGroups = true
        state.error = null
      })
      .addCase(fetchTagGroupsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingTagGroups = false
        state.tagGroups = action.payload
      })
      .addCase(fetchTagGroupsForProductEdit.rejected, (state, action) => {
        state.isLoadingTagGroups = false
        state.error = (action.payload as string) || 'Failed to fetch tag groups'
      })
      // Tags for edit (reuses same state)
      .addCase(fetchTagsForProductEdit.pending, (state) => {
        state.isLoadingTags = true
        state.error = null
      })
      .addCase(fetchTagsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingTags = false
        state.tags = action.payload
      })
      .addCase(fetchTagsForProductEdit.rejected, (state, action) => {
        state.isLoadingTags = false
        state.error = (action.payload as string) || 'Failed to fetch tags'
      })
      // ========== OPTIONS EDIT HANDLERS (reuse same state) ==========
      // Metal types for edit
      .addCase(fetchMetalTypesForProductEdit.pending, (state) => {
        state.isLoadingMetalTypes = true
        state.error = null
      })
      .addCase(fetchMetalTypesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingMetalTypes = false
        state.metalTypes = action.payload
      })
      .addCase(fetchMetalTypesForProductEdit.rejected, (state, action) => {
        state.isLoadingMetalTypes = false
        state.error = (action.payload as string) || 'Failed to fetch metal types'
      })
      // Metal colors for edit
      .addCase(fetchMetalColorsForProductEdit.pending, (state) => {
        state.isLoadingMetalColors = true
        state.error = null
      })
      .addCase(fetchMetalColorsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingMetalColors = false
        state.metalColors = action.payload
      })
      .addCase(fetchMetalColorsForProductEdit.rejected, (state, action) => {
        state.isLoadingMetalColors = false
        state.error = (action.payload as string) || 'Failed to fetch metal colors'
      })
      // Metal purities for edit
      .addCase(fetchMetalPuritiesForProductEdit.pending, (state) => {
        state.isLoadingMetalPurities = true
        state.error = null
      })
      .addCase(fetchMetalPuritiesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingMetalPurities = false
        state.metalPurities = action.payload
      })
      .addCase(fetchMetalPuritiesForProductEdit.rejected, (state, action) => {
        state.isLoadingMetalPurities = false
        state.error = (action.payload as string) || 'Failed to fetch metal purities'
      })
      // Stone shapes for edit
      .addCase(fetchStoneShapesForProductEdit.pending, (state) => {
        state.isLoadingStoneShapes = true
        state.error = null
      })
      .addCase(fetchStoneShapesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingStoneShapes = false
        state.stoneShapes = action.payload
      })
      .addCase(fetchStoneShapesForProductEdit.rejected, (state, action) => {
        state.isLoadingStoneShapes = false
        state.error = (action.payload as string) || 'Failed to fetch stone shapes'
      })
      // Diamond clarity colors for edit
      .addCase(fetchDiamondClarityColorsForProductEdit.pending, (state) => {
        state.isLoadingDiamondClarityColors = true
        state.error = null
      })
      .addCase(fetchDiamondClarityColorsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingDiamondClarityColors = false
        state.diamondClarityColors = action.payload
      })
      .addCase(fetchDiamondClarityColorsForProductEdit.rejected, (state, action) => {
        state.isLoadingDiamondClarityColors = false
        state.error = (action.payload as string) || 'Failed to fetch diamond clarity colors'
      })
      // Diamond pricings for edit
      .addCase(fetchDiamondPricingsForProductEdit.pending, (state) => {
        state.isLoadingDiamondPricings = true
        state.error = null
      })
      .addCase(fetchDiamondPricingsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingDiamondPricings = false
        state.diamondPricings = action.payload
      })
      .addCase(fetchDiamondPricingsForProductEdit.rejected, (state, action) => {
        state.isLoadingDiamondPricings = false
        state.error = (action.payload as string) || 'Failed to fetch diamond pricings'
      })
      // Gemstone types for edit
      .addCase(fetchGemstoneTypesForProductEdit.pending, (state) => {
        state.isLoadingGemstoneTypes = true
        state.error = null
      })
      .addCase(fetchGemstoneTypesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingGemstoneTypes = false
        state.gemstoneTypes = action.payload
      })
      .addCase(fetchGemstoneTypesForProductEdit.rejected, (state, action) => {
        state.isLoadingGemstoneTypes = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone types'
      })
      // Gemstone qualities for edit
      .addCase(fetchGemstoneQualitiesForProductEdit.pending, (state) => {
        state.isLoadingGemstoneQualities = true
        state.error = null
      })
      .addCase(fetchGemstoneQualitiesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingGemstoneQualities = false
        state.gemstoneQualities = action.payload
      })
      .addCase(fetchGemstoneQualitiesForProductEdit.rejected, (state, action) => {
        state.isLoadingGemstoneQualities = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone qualities'
      })
      // Gemstone colors for edit
      .addCase(fetchGemstoneColorsForProductEdit.pending, (state) => {
        state.isLoadingGemstoneColors = true
        state.error = null
      })
      .addCase(fetchGemstoneColorsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingGemstoneColors = false
        state.gemstoneColors = action.payload
      })
      .addCase(fetchGemstoneColorsForProductEdit.rejected, (state, action) => {
        state.isLoadingGemstoneColors = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone colors'
      })
      // Gemstone pricings for edit
      .addCase(fetchGemstonePricingsForProductEdit.pending, (state) => {
        state.isLoadingGemstonePricings = true
        state.error = null
      })
      .addCase(fetchGemstonePricingsForProductEdit.fulfilled, (state, action) => {
        state.isLoadingGemstonePricings = false
        state.gemstonePricings = action.payload
      })
      .addCase(fetchGemstonePricingsForProductEdit.rejected, (state, action) => {
        state.isLoadingGemstonePricings = false
        state.error = (action.payload as string) || 'Failed to fetch gemstone pricings'
      })
      // Pearl types for edit
      .addCase(fetchPearlTypesForProductEdit.pending, (state) => {
        state.isLoadingPearlTypes = true
        state.error = null
      })
      .addCase(fetchPearlTypesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingPearlTypes = false
        state.pearlTypes = action.payload
      })
      .addCase(fetchPearlTypesForProductEdit.rejected, (state, action) => {
        state.isLoadingPearlTypes = false
        state.error = (action.payload as string) || 'Failed to fetch pearl types'
      })
      // Pearl qualities for edit
      .addCase(fetchPearlQualitiesForProductEdit.pending, (state) => {
        state.isLoadingPearlQualities = true
        state.error = null
      })
      .addCase(fetchPearlQualitiesForProductEdit.fulfilled, (state, action) => {
        state.isLoadingPearlQualities = false
        state.pearlQualities = action.payload
      })
      .addCase(fetchPearlQualitiesForProductEdit.rejected, (state, action) => {
        state.isLoadingPearlQualities = false
        state.error = (action.payload as string) || 'Failed to fetch pearl qualities'
      })
  },
})

export const { clearError } = productSlice.actions
export default productSlice.reducer
