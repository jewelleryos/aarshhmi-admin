// API Endpoints Configuration
// All API endpoints in one place for easy management

const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VALIDATE_RESET_TOKEN: '/api/auth/validate-reset-token',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // Users endpoints
  USERS: {
    LIST: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    STATUS: (id: string) => `/api/users/${id}/status`,
    DELETE: (id: string) => `/api/users/${id}`,
  },

  // Media endpoints
  MEDIA: {
    LIST: '/api/media/list',
    UPLOAD: '/api/media/upload',
    CREATE_FOLDER: '/api/media/folder',
    DELETE_FILES: '/api/media/delete-files',
    DELETE_FOLDER: '/api/media/folder',
    DOWNLOAD_FILE: '/api/media/download/file',
    DOWNLOAD_FOLDER: '/api/media/download/folder',
  },

  // Metal Type endpoints
  METAL_TYPE: {
    LIST: '/api/metal-types',
    GET: (id: string) => `/api/metal-types/${id}`,
    CREATE: '/api/metal-types',
    UPDATE: (id: string) => `/api/metal-types/${id}`,
    FOR_METAL_COLOR: '/api/metal-types/for-metal-color',
    FOR_METAL_PURITY: '/api/metal-types/for-metal-purity',
    FOR_MAKING_CHARGE: '/api/metal-types/for-making-charge',
  },

  // Metal Color endpoints
  METAL_COLOR: {
    LIST: '/api/metal-colors',
    GET: (id: string) => `/api/metal-colors/${id}`,
    CREATE: '/api/metal-colors',
    UPDATE: (id: string) => `/api/metal-colors/${id}`,
  },

  // Metal Purity endpoints
  METAL_PURITY: {
    LIST: '/api/metal-purities',
    GET: (id: string) => `/api/metal-purities/${id}`,
    CREATE: '/api/metal-purities',
    UPDATE: (id: string) => `/api/metal-purities/${id}`,
  },

  // Stone Shape endpoints
  STONE_SHAPE: {
    LIST: '/api/stone-shapes',
    GET: (id: string) => `/api/stone-shapes/${id}`,
    CREATE: '/api/stone-shapes',
    UPDATE: (id: string) => `/api/stone-shapes/${id}`,
  },

  // Gemstone Type endpoints
  GEMSTONE_TYPE: {
    LIST: '/api/gemstone-types',
    GET: (id: string) => `/api/gemstone-types/${id}`,
    CREATE: '/api/gemstone-types',
    UPDATE: (id: string) => `/api/gemstone-types/${id}`,
  },

  // Gemstone Quality endpoints
  GEMSTONE_QUALITY: {
    LIST: '/api/gemstone-qualities',
    GET: (id: string) => `/api/gemstone-qualities/${id}`,
    CREATE: '/api/gemstone-qualities',
    UPDATE: (id: string) => `/api/gemstone-qualities/${id}`,
  },

  // Gemstone Color endpoints
  GEMSTONE_COLOR: {
    LIST: '/api/gemstone-colors',
    GET: (id: string) => `/api/gemstone-colors/${id}`,
    CREATE: '/api/gemstone-colors',
    UPDATE: (id: string) => `/api/gemstone-colors/${id}`,
  },

  // Diamond Clarity/Color endpoints
  DIAMOND_CLARITY_COLOR: {
    LIST: '/api/diamond-clarity-color',
    GET: (id: string) => `/api/diamond-clarity-color/${id}`,
    CREATE: '/api/diamond-clarity-color',
    UPDATE: (id: string) => `/api/diamond-clarity-color/${id}`,
    DROPDOWN: '/api/diamond-clarity-color/dropdown',
  },

  // Stone Shape dropdown endpoint (for Diamond Pricing)
  STONE_SHAPE_DROPDOWN: '/api/stone-shapes/dropdown',

  // Diamond Pricing endpoints
  DIAMOND_PRICING: {
    LIST: '/api/diamond-prices',
    GET: (id: string) => `/api/diamond-prices/${id}`,
    CREATE: '/api/diamond-prices',
    UPDATE: (id: string) => `/api/diamond-prices/${id}`,
    // Bulk operations
    TEMPLATE: '/api/diamond-prices/template',
    REFERENCE: '/api/diamond-prices/reference',
    EXPORT: '/api/diamond-prices/export',
    BULK_CREATE: '/api/diamond-prices/bulk-create',
    BULK_UPDATE: '/api/diamond-prices/bulk-update',
  },

  // Gemstone Pricing dropdown endpoints
  GEMSTONE_TYPE_DROPDOWN: '/api/gemstone-types/dropdown',
  GEMSTONE_QUALITY_DROPDOWN: '/api/gemstone-qualities/dropdown',
  GEMSTONE_COLOR_DROPDOWN: '/api/gemstone-colors/dropdown',

  // Gemstone Pricing endpoints
  GEMSTONE_PRICING: {
    LIST: '/api/gemstone-prices',
    GET: (id: string) => `/api/gemstone-prices/${id}`,
    CREATE: '/api/gemstone-prices',
    UPDATE: (id: string) => `/api/gemstone-prices/${id}`,
    // Bulk operations
    TEMPLATE: '/api/gemstone-prices/template',
    REFERENCE: '/api/gemstone-prices/reference',
    EXPORT: '/api/gemstone-prices/export',
    BULK_CREATE: '/api/gemstone-prices/bulk-create',
    BULK_UPDATE: '/api/gemstone-prices/bulk-update',
  },

  // Making Charges endpoints
  MAKING_CHARGES: {
    LIST: '/api/making-charges',
    GET: (id: string) => `/api/making-charges/${id}`,
    CREATE: '/api/making-charges',
    UPDATE: (id: string) => `/api/making-charges/${id}`,
  },

  // Other Charges endpoints
  OTHER_CHARGES: {
    LIST: '/api/other-charges',
    GET: (id: string) => `/api/other-charges/${id}`,
    CREATE: '/api/other-charges',
    UPDATE: (id: string) => `/api/other-charges/${id}`,
    DELETE: (id: string) => `/api/other-charges/${id}`,
  },

  // Pearl Type endpoints
  PEARL_TYPE: {
    LIST: '/api/pearl-types',
    GET: (id: string) => `/api/pearl-types/${id}`,
    CREATE: '/api/pearl-types',
    UPDATE: (id: string) => `/api/pearl-types/${id}`,
  },

  // Pearl Quality endpoints
  PEARL_QUALITY: {
    LIST: '/api/pearl-qualities',
    GET: (id: string) => `/api/pearl-qualities/${id}`,
    CREATE: '/api/pearl-qualities',
    UPDATE: (id: string) => `/api/pearl-qualities/${id}`,
  },

  // MRP Markup endpoints
  MRP_MARKUP: {
    GET: '/api/mrp-markup',
    UPDATE: '/api/mrp-markup',
  },

  // Tag Group endpoints
  TAG_GROUP: {
    LIST: '/api/tag-groups',
    GET: (id: string) => `/api/tag-groups/${id}`,
    CREATE: '/api/tag-groups',
    UPDATE: (id: string) => `/api/tag-groups/${id}`,
    UPDATE_SEO: (id: string) => `/api/tag-groups/${id}/seo`,
  },

  // Tag endpoints
  TAG: {
    LIST: '/api/tags',
    GET: (id: string) => `/api/tags/${id}`,
    CREATE: '/api/tags',
    UPDATE: (id: string) => `/api/tags/${id}`,
    UPDATE_SEO: (id: string) => `/api/tags/${id}/seo`,
  },

  // Category endpoints
  CATEGORY: {
    LIST: '/api/categories',
    LIST_FLAT: '/api/categories/flat',
    GET: (id: string) => `/api/categories/${id}`,
    CREATE: '/api/categories',
    UPDATE: (id: string) => `/api/categories/${id}`,
    UPDATE_SEO: (id: string) => `/api/categories/${id}/seo`,
  },

  // Badge endpoints
  BADGE: {
    LIST: '/api/badges',
    GET: (id: string) => `/api/badges/${id}`,
    CREATE: '/api/badges',
    UPDATE: (id: string) => `/api/badges/${id}`,
  },

  // Size Chart Group endpoints
  SIZE_CHART_GROUP: {
    LIST: '/api/size-chart-groups',
    GET: (id: string) => `/api/size-chart-groups/${id}`,
    CREATE: '/api/size-chart-groups',
    UPDATE: (id: string) => `/api/size-chart-groups/${id}`,
    DROPDOWN: '/api/size-chart-groups/dropdown',
  },

  // Size Chart Value endpoints
  SIZE_CHART_VALUE: {
    LIST: '/api/size-chart-values',
    GET: (id: string) => `/api/size-chart-values/${id}`,
    CREATE: '/api/size-chart-values',
    UPDATE: (id: string) => `/api/size-chart-values/${id}`,
    MAKE_DEFAULT: (id: string) => `/api/size-chart-values/${id}/make-default`,
    DELETE: (id: string) => `/api/size-chart-values/${id}`,
  },

  // Product endpoints
  PRODUCT: {
    LIST: '/api/products',
    GET: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE_BASIC: (id: string) => `/api/products/${id}/basic`,
    UPDATE_ATTRIBUTES: (id: string) => `/api/products/${id}/attributes`,
    UPDATE_SEO: (id: string) => `/api/products/${id}/seo`,
    UPDATE_MEDIA: (id: string) => `/api/products/${id}/media`,
    UPDATE_OPTIONS: (id: string) => `/api/products/${id}/options`,
    FOR_PRICING_RULE: '/api/products/for-pricing-rule',
    SIZE_CHART_GROUPS: '/api/size-chart-groups/for-product',
    SIZE_CHART_GROUPS_FOR_EDIT: '/api/size-chart-groups/for-product-edit',
    METAL_TYPES: '/api/metal-types/for-product',
    METAL_COLORS: '/api/metal-colors/for-product',
    METAL_PURITIES: '/api/metal-purities/for-product',
    // Stone endpoints
    STONE_SHAPES: '/api/stone-shapes/for-product',
    DIAMOND_CLARITY_COLORS: '/api/diamond-clarity-color/for-product',
    DIAMOND_PRICINGS: '/api/diamond-prices/for-product',
    GEMSTONE_TYPES: '/api/gemstone-types/for-product',
    GEMSTONE_QUALITIES: '/api/gemstone-qualities/for-product',
    GEMSTONE_COLORS: '/api/gemstone-colors/for-product',
    GEMSTONE_PRICINGS: '/api/gemstone-prices/for-product',
    PEARL_TYPES: '/api/pearl-types/for-product',
    PEARL_QUALITIES: '/api/pearl-qualities/for-product',
    // Attributes endpoints (for create)
    BADGES: '/api/badges/for-product',
    CATEGORIES: '/api/categories/for-product',
    TAG_GROUPS: '/api/tag-groups/for-product',
    TAGS: '/api/tags/for-product',
    // Attributes endpoints (for edit)
    BADGES_FOR_EDIT: '/api/badges/for-product-edit',
    CATEGORIES_FOR_EDIT: '/api/categories/for-product-edit',
    TAG_GROUPS_FOR_EDIT: '/api/tag-groups/for-product-edit',
    TAGS_FOR_EDIT: '/api/tags/for-product-edit',
    // Options endpoints (for edit) - uses PRODUCT.UPDATE permission
    METAL_TYPES_FOR_EDIT: '/api/metal-types/for-product-edit',
    METAL_COLORS_FOR_EDIT: '/api/metal-colors/for-product-edit',
    METAL_PURITIES_FOR_EDIT: '/api/metal-purities/for-product-edit',
    STONE_SHAPES_FOR_EDIT: '/api/stone-shapes/for-product-edit',
    DIAMOND_CLARITY_COLORS_FOR_EDIT: '/api/diamond-clarity-color/for-product-edit',
    DIAMOND_PRICINGS_FOR_EDIT: '/api/diamond-prices/for-product-edit',
    GEMSTONE_TYPES_FOR_EDIT: '/api/gemstone-types/for-product-edit',
    GEMSTONE_QUALITIES_FOR_EDIT: '/api/gemstone-qualities/for-product-edit',
    GEMSTONE_COLORS_FOR_EDIT: '/api/gemstone-colors/for-product-edit',
    GEMSTONE_PRICINGS_FOR_EDIT: '/api/gemstone-prices/for-product-edit',
    PEARL_TYPES_FOR_EDIT: '/api/pearl-types/for-product-edit',
    PEARL_QUALITIES_FOR_EDIT: '/api/pearl-qualities/for-product-edit',
    // Status and stock update endpoints
    UPDATE_STATUS: (id: string) => `/api/products/${id}/status`,
    UPDATE_VARIANT_STOCK: (productId: string, variantId: string) =>
      `/api/products/${productId}/variants/${variantId}/stock`,
  },

  // Pricing Rule endpoints
  PRICING_RULE: {
    LIST: '/api/pricing-rules',
    GET: (id: string) => `/api/pricing-rules/${id}`,
    CREATE: '/api/pricing-rules',
    UPDATE: (id: string) => `/api/pricing-rules/${id}`,
    DELETE: (id: string) => `/api/pricing-rules/${id}`,
    CATEGORIES: '/api/categories/for-pricing-rule',
    TAGS: '/api/tags/for-pricing-rule',
    BADGES: '/api/badges/for-pricing-rule',
    METAL_TYPES: '/api/metal-types/for-pricing-rule',
    METAL_COLORS: '/api/metal-colors/for-pricing-rule',
    METAL_PURITIES: '/api/metal-purities/for-pricing-rule',
    DIAMOND_CLARITY_COLORS: '/api/diamond-clarity-color/for-pricing-rule',
  },

  // Storefront Filters endpoints
  STOREFRONT_FILTERS: {
    LIST: '/api/storefront-filters',
    UPDATE_GROUP: (id: string) => `/api/storefront-filters/${id}`,
    UPDATE_VALUE: (groupId: string, valueId: string) =>
      `/api/storefront-filters/${groupId}/values/${valueId}`,
    // Price ranges
    PRICE_RANGES_LIST: '/api/storefront-filters/price-ranges',
    PRICE_RANGE_CREATE: '/api/storefront-filters/price-ranges',
    PRICE_RANGE_UPDATE: (id: string) => `/api/storefront-filters/price-ranges/${id}`,
    PRICE_RANGE_DELETE: (id: string) => `/api/storefront-filters/price-ranges/${id}`,
    // Sort-by options
    SORT_BY_OPTIONS_LIST: '/api/storefront-filters/sort-by',
    SORT_BY_OPTION_UPDATE: (id: string) => `/api/storefront-filters/sort-by/${id}`,
    // Group config
    GROUP_CONFIG_LIST: '/api/storefront-filters/group-config',
    GROUP_CONFIG_UPDATE: (id: string) => `/api/storefront-filters/group-config/${id}`,
  },

  // CMS endpoints
  // Price Recalculation endpoints
  PRICE_RECALCULATION: {
    JOBS: '/api/price-recalculation/jobs',
    TRIGGER: '/api/price-recalculation/trigger',
  },
}

export default API_ENDPOINTS
