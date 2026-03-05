// ========================================
// Coupon list item (from API)
// ========================================
export interface CouponListItem {
  id: string
  code: string
  type: string
  typeLabel: string
  discountDisplay: string
  isActive: boolean
  validFrom: string | null
  validUntil: string | null
  usageCount: number
  usageLimit: number | null
  createdAt: string
}

// ========================================
// Coupon detail (from API)
// ========================================
export interface CouponDetail {
  id: string
  code: string
  type: string
  discount_type: 'flat' | 'percentage' | null
  discount_value: number | null
  discount_percent: number | null
  max_discount: number | null
  max_discount_per_product: number | null
  applicable_product_ids: string[] | null
  assigned_customer_emails: string[] | null
  conditions: CouponCondition[]
  min_cart_value: number | null
  valid_from: string | null
  valid_until: string | null
  usage_limit: number | null
  usage_count: number
  is_active: boolean
  guest_allowed: boolean
  show_on_storefront: boolean
  description: string | null
  display_text: string | null
  metadata: CouponMetadata
  created_at: string
  updated_at: string
  activeCartCount: number
}

// ========================================
// Metadata
// ========================================
export interface CouponMetadata {
  terms_and_conditions?: string | null
  assigned_customer_ids?: string[] | null
}

// ========================================
// Condition
// ========================================
export interface CouponCondition {
  field: string
  operator: string
  value: any
}

// ========================================
// Coupon type definition (from API /types)
// ========================================
export interface CouponTypeDefinition {
  code: string
  label: string
  description: string
  discountMode: 'flat' | 'percentage' | 'configurable'
  targetLevel: 'cart' | 'product' | 'component'
  componentTarget?: string
  availableConditions: string[]
  fixedBehaviors: {
    guestAllowed?: boolean
    requiresAuth?: boolean
    showOnStorefront?: boolean
  }
  requiresProductIds: boolean
  requiresCustomerEmails: boolean
}

// ========================================
// Type badge color map
// ========================================
export const TYPE_BADGE_COLORS: Record<string, string> = {
  cart_flat: 'bg-blue-50 text-blue-700 border-blue-200',
  cart_percentage: 'bg-blue-50 text-blue-700 border-blue-200',
  first_purchase: 'bg-purple-50 text-purple-700 border-purple-200',
  product_flat: 'bg-orange-50 text-orange-700 border-orange-200',
  product_percentage: 'bg-orange-50 text-orange-700 border-orange-200',
  customer_specific: 'bg-pink-50 text-pink-700 border-pink-200',
  making_charge_discount: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  diamond_discount: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  gemstone_discount: 'bg-amber-50 text-amber-700 border-amber-200',
}

// ========================================
// Condition field labels
// ========================================
export const CONDITION_FIELD_LABELS: Record<string, string> = {
  cart_subtotal: 'Cart Subtotal',
  item_count: 'Item Count',
  unit_price: 'Unit Price',
  metal_type: 'Metal Type',
  metal_purity: 'Metal Purity',
  metal_color: 'Metal Color',
  diamond_clarity_color: 'Diamond Clarity & Color',
  gemstone_color: 'Gemstone Color',
  product_category: 'Product Category',
  tag: 'Tag',
}

// Fields that use numeric input (Rs or count)
export const NUMERIC_CONDITION_FIELDS = new Set([
  'cart_subtotal',
  'item_count',
  'unit_price',
])

// Fields that use multi-select checkbox grid
export const MULTI_SELECT_CONDITION_FIELDS = new Set([
  'metal_type',
  'metal_purity',
  'metal_color',
  'diamond_clarity_color',
  'gemstone_color',
  'product_category',
  'tag',
])

// ========================================
// Condition operators per field
// ========================================
export const CONDITION_OPERATORS: Record<string, { value: string; label: string }[]> = {
  cart_subtotal: [
    { value: '>=', label: 'Greater than or equal' },
    { value: '<=', label: 'Less than or equal' },
  ],
  item_count: [
    { value: '>=', label: 'Greater than or equal' },
    { value: '<=', label: 'Less than or equal' },
  ],
  unit_price: [
    { value: '>=', label: 'Greater than or equal' },
    { value: '<=', label: 'Less than or equal' },
  ],
  metal_type: [{ value: 'in', label: 'Is any of' }],
  metal_purity: [{ value: 'in', label: 'Is any of' }],
  metal_color: [{ value: 'in', label: 'Is any of' }],
  diamond_clarity_color: [{ value: 'in', label: 'Is any of' }],
  gemstone_color: [{ value: 'in', label: 'Is any of' }],
  product_category: [{ value: 'in', label: 'Is any of' }],
  tag: [{ value: 'in', label: 'Is any of' }],
}
