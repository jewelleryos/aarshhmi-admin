/**
 * Product Type Configuration
 *
 * Static product types for price calculation logic.
 * These are internal types - for user-defined categorization, use Tag Groups.
 */

export const PRODUCT_TYPES = {
  JEWELLERY_DEFAULT: {
    code: 'JEWELLERY_DEFAULT',
    name: 'Jewellery (Default)',
    description: 'Standard jewellery with metal and optional stones',
    calculation_type: 'jewelry',
    components: ['metal', 'stone', 'making_charge', 'other_charges'],
    making_charge_on: 'net_weight',
    requires_weight: true,
    ui_hints: {
      show_weight_fields: true,
      show_stone_options: true,
      suggested_options: ['Metal Type', 'Metal Purity', 'Metal Color', 'Stone Type', 'Size'],
    },
  },
} as const

export type ProductTypeCode = keyof typeof PRODUCT_TYPES
export type ProductTypeConfig = (typeof PRODUCT_TYPES)[ProductTypeCode]

/**
 * Get product type configuration by code
 */
export function getProductTypeConfig(code: ProductTypeCode): ProductTypeConfig {
  return PRODUCT_TYPES[code]
}

/**
 * Get all product types for dropdown lists
 */
export function getProductTypesList() {
  return Object.values(PRODUCT_TYPES).map((pt) => ({
    code: pt.code,
    name: pt.name,
    description: pt.description,
  }))
}

/**
 * Check if a product type code is valid
 */
export function isValidProductType(code: string): code is ProductTypeCode {
  return code in PRODUCT_TYPES
}
