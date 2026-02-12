# Pricing Rule - Applicable Products Feature

This document outlines the design and implementation approach for showing applicable products in the Pricing Rule Create page. The feature will display all products that match a pricing rule's conditions along with their current selling price and calculated new selling price based on the rule's markup actions.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Key Concept: Markup on Cost Price](#key-concept-markup-on-cost-price)
3. [Data Requirements](#data-requirements)
4. [Architecture: Frontend Processing](#architecture-frontend-processing)
5. [Tax Configuration in Frontend](#tax-configuration-in-frontend)
6. [Price Calculation Logic](#price-calculation-logic)
7. [Frontend Implementation](#frontend-implementation)
8. [UI/UX Design](#uiux-design)
9. [Implementation Steps](#implementation-steps)
10. [Effort Estimation](#effort-estimation)

---

## Feature Overview

### Purpose
Show which products will be affected by a pricing rule and preview the price changes (current selling price → new selling price) when creating a new rule.

### Where It Appears
- **Create Page Only** (`/masters/pricing-rule/create`)
- NOT on edit page (rule already exists)

### Key Features
- Display all products matching the rule's conditions
- Show current selling price (old)
- Show new selling price (calculated with markups applied to COST PRICE)
- Show price difference (amount and percentage)
- Real-time calculation as user changes conditions/actions

### User Flow
1. User opens "Add Pricing Rule" page
2. User configures conditions and markup actions
3. "Applicable Products" section shows matching products with:
   - Product name, SKU, variant info
   - Current Selling Price
   - New Selling Price (calculated)
   - Price Difference

---

## Key Concept: Markup on Cost Price

### Important Rule
**Markups are ALWAYS applied to COST PRICE components, NOT to the current selling price.**

This means:
- If a product has diamond cost = ₹10,000 and user creates a rule with 10% diamond markup
- New diamond component = ₹10,000 × 1.10 = ₹11,000
- If user later creates ANOTHER rule with 5% diamond markup, it also applies to the ORIGINAL cost:
- New diamond component = ₹10,000 × 1.05 = ₹10,500 (NOT ₹11,000 × 1.05)

### Why This Approach?
- Rules don't compound on each other
- Each rule is independent and predictable
- Easy to understand the price impact of each rule
- Consistent pricing regardless of rule creation order

### Formula Summary
```
New Selling Price =
  Metal Cost (no markup) +
  Making Charge Cost × (1 + makingChargeMarkup%) +
  Diamond Cost × (1 + diamondMarkup%) +
  Gemstone Cost × (1 + gemstoneMarkup%) +
  Pearl Cost × (1 + pearlMarkup%) +
  Tax (if applicable)
```

---

## Data Requirements

### Pricing Rule Structure (Existing)

```typescript
interface PricingRule {
  id: string
  name: string
  product_type: ProductType
  conditions: PricingRuleCondition[]  // Matching criteria
  actions: PricingRuleActions          // Markup percentages
  is_active: boolean
}

interface PricingRuleCondition {
  type: ConditionType
  value: ConditionValue
}

// 9 condition types:
// category, tags, badges, diamond_carat, metal_weight,
// metal_type, metal_color, metal_purity, diamond_clarity_color

interface PricingRuleActions {
  diamondMarkup: number      // Percentage markup on diamond COST
  makingChargeMarkup: number // Percentage markup on making charge COST
  gemstoneMarkup: number     // Percentage markup on gemstone COST
  pearlMarkup: number        // Percentage markup on pearl COST
}
```

### Product Data Required for Matching

Each product/variant needs the following data for condition matching:

| Condition Type | Product Data Source |
|----------------|---------------------|
| `category` | `product.categories[]` → category IDs |
| `tags` | `product.tags[]` → tag IDs |
| `badges` | `product.badges[]` → badge IDs |
| `metal_type` | `variant.metadata.metalType` (slug) |
| `metal_color` | `variant.metadata.metalColor` (slug) |
| `metal_purity` | `variant.metadata.metalPurity` (slug) |
| `metal_weight` | `variant.metadata.metalWeight` (grams) |
| `diamond_carat` | `variant.metadata.weights.diamond.carat` |
| `diamond_clarity_color` | `variant.metadata.diamondClarityColor` (slug) |

### Product Pricing Data (from `price_components` JSONB)

```typescript
interface PriceComponents {
  costPrice: {
    metalPrice: number       // In paise
    makingCharge: number     // In paise
    diamondPrice: number     // In paise
    gemstonePrice: number    // In paise
    pearlPrice: number       // In paise
    finalPriceWithoutTax: number
    taxAmount: number
    finalPriceWithTax: number
    finalPrice: number
    taxIncluded: boolean
  }
  sellingPrice: {
    // Same structure as costPrice
    // This is the CURRENT selling price
  }
  compareAtPrice: {
    // Same structure
  }
}
```

---

## Architecture: Frontend Processing

### Why Frontend Processing?

1. **Real-time Preview**: Calculate instantly as user changes conditions/actions
2. **No API Calls**: No need for preview endpoint, reduces complexity
3. **Better UX**: Immediate feedback without loading states
4. **Product Count**: Typically manageable (< 1000 products for jewelry stores)

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Page Load                                                                │
│     ├── Fetch ALL products with variants (one-time)                         │
│     ├── Fetch tax configuration                                             │
│     └── Store in component state                                            │
│                                                                              │
│  2. User Changes Conditions/Actions                                          │
│     ├── Filter products that match conditions (local)                       │
│     ├── Calculate new prices for matching variants (local)                  │
│     └── Display results in table                                            │
│                                                                              │
│  3. Real-time Updates                                                        │
│     └── Recalculate on every condition/action change                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Endpoint for Products

Use existing product list endpoint OR create a simplified one:

```typescript
// Option 1: Use existing getAll with full details
GET /api/products?include=variants,categories,tags,badges

// Option 2: Create lightweight endpoint for pricing preview
GET /api/products/pricing-preview

// Returns:
interface ProductForPricingPreview {
  id: string
  name: string
  base_sku: string
  categories: { id: string }[]
  tags: { id: string }[]
  badges: { id: string }[]
  variants: {
    id: string
    sku: string
    variant_name: string | null
    price: number              // Current selling price (paise)
    price_components: {
      costPrice: {
        metalPrice: number
        makingCharge: number
        diamondPrice: number
        gemstonePrice: number
        pearlPrice: number
        taxAmount: number
        taxIncluded: boolean
      }
    }
    metadata: {
      metalType: string        // Slug
      metalColor: string       // Slug
      metalPurity: string      // Slug
      metalWeight: number      // Grams
      diamondClarityColor?: string  // Slug
      weights?: {
        diamond?: { carat: number }
        gemstone?: { carat: number }
      }
    }
  }[]
}
```

---

## Tax Configuration in Frontend

### Current State
Tax configuration exists in backend only:
- `backend/src/config/currency.ts`

### Required: Add Tax Config to Frontend

Create a new config file in admin:

```typescript
// admin/src/configs/tax.ts

export const TAX_CONFIG = {
  // Whether tax is included in displayed prices
  includeTax: true,

  // Tax rate percentage (e.g., 3% GST for jewelry in India)
  taxRatePercent: 3,

  // Tax calculation method
  // 'inclusive' = prices already include tax
  // 'exclusive' = tax added on top of prices
  taxMethod: 'inclusive' as const,
}

// Helper functions
export function calculateTax(amountWithoutTax: number): number {
  return Math.round(amountWithoutTax * (TAX_CONFIG.taxRatePercent / 100))
}

export function addTax(amountWithoutTax: number): number {
  if (!TAX_CONFIG.includeTax) return amountWithoutTax
  return amountWithoutTax + calculateTax(amountWithoutTax)
}

export function removeTax(amountWithTax: number): number {
  if (!TAX_CONFIG.includeTax) return amountWithTax
  return Math.round(amountWithTax / (1 + TAX_CONFIG.taxRatePercent / 100))
}
```

### Sync with Backend

Ensure frontend tax config matches backend:

```typescript
// backend/src/config/currency.ts (existing)
export const CURRENCY_CONFIG = {
  code: 'INR',
  locale: 'en-IN',
  subunits: 100,
  includeTax: true,
  taxRatePercent: 3,
}
```

---

## Price Calculation Logic

### Step-by-Step Calculation

```typescript
// admin/src/utils/pricing-rule-calculator.ts

import { TAX_CONFIG, addTax } from '@/configs/tax'

interface CostPriceComponents {
  metalPrice: number      // In paise
  makingCharge: number    // In paise
  diamondPrice: number    // In paise
  gemstonePrice: number   // In paise
  pearlPrice: number      // In paise
}

interface PricingRuleActions {
  diamondMarkup: number
  makingChargeMarkup: number
  gemstoneMarkup: number
  pearlMarkup: number
}

/**
 * Calculate new selling price by applying markups to COST PRICE components
 *
 * @param costComponents - The COST price breakdown (not selling price)
 * @param actions - Markup percentages from the pricing rule
 * @returns New selling price in paise
 */
export function calculateNewSellingPrice(
  costComponents: CostPriceComponents,
  actions: PricingRuleActions
): number {
  // Step 1: Apply markups to individual COST components
  const metalPrice = costComponents.metalPrice  // No markup on metal

  const newMakingCharge = Math.round(
    costComponents.makingCharge * (1 + actions.makingChargeMarkup / 100)
  )

  const newDiamondPrice = Math.round(
    costComponents.diamondPrice * (1 + actions.diamondMarkup / 100)
  )

  const newGemstonePrice = Math.round(
    costComponents.gemstonePrice * (1 + actions.gemstoneMarkup / 100)
  )

  const newPearlPrice = Math.round(
    costComponents.pearlPrice * (1 + actions.pearlMarkup / 100)
  )

  // Step 2: Sum all components (before tax)
  const totalBeforeTax = metalPrice + newMakingCharge + newDiamondPrice + newGemstonePrice + newPearlPrice

  // Step 3: Add tax if configured
  const finalPrice = addTax(totalBeforeTax)

  return finalPrice
}

/**
 * Calculate price breakdown for display
 */
export function calculatePriceBreakdown(
  costComponents: CostPriceComponents,
  actions: PricingRuleActions
): {
  metalPrice: number
  makingCharge: number
  diamondPrice: number
  gemstonePrice: number
  pearlPrice: number
  subtotal: number
  taxAmount: number
  total: number
} {
  const metalPrice = costComponents.metalPrice
  const makingCharge = Math.round(costComponents.makingCharge * (1 + actions.makingChargeMarkup / 100))
  const diamondPrice = Math.round(costComponents.diamondPrice * (1 + actions.diamondMarkup / 100))
  const gemstonePrice = Math.round(costComponents.gemstonePrice * (1 + actions.gemstoneMarkup / 100))
  const pearlPrice = Math.round(costComponents.pearlPrice * (1 + actions.pearlMarkup / 100))

  const subtotal = metalPrice + makingCharge + diamondPrice + gemstonePrice + pearlPrice
  const taxAmount = TAX_CONFIG.includeTax
    ? Math.round(subtotal * (TAX_CONFIG.taxRatePercent / 100))
    : 0
  const total = subtotal + taxAmount

  return {
    metalPrice,
    makingCharge,
    diamondPrice,
    gemstonePrice,
    pearlPrice,
    subtotal,
    taxAmount,
    total
  }
}
```

### Example Calculation

**Given:**
- Variant Cost Price Components:
  - Metal: ₹25,000 (2500000 paise)
  - Making Charge: ₹3,000 (300000 paise)
  - Diamond: ₹15,000 (1500000 paise)
  - Gemstone: ₹0
  - Pearl: ₹0

- Current Selling Price: ₹44,290 (same as cost + tax, since no markup currently)

- Rule Actions:
  - Diamond Markup: 20%
  - Making Charge Markup: 15%
  - Gemstone Markup: 10%
  - Pearl Markup: 5%

**Calculation:**
```
Metal (no markup):     ₹25,000.00
Making Charge:         ₹3,000 × 1.15 = ₹3,450.00
Diamond:               ₹15,000 × 1.20 = ₹18,000.00
Gemstone:              ₹0 × 1.10 = ₹0.00
Pearl:                 ₹0 × 1.05 = ₹0.00
─────────────────────────────────────────────
Subtotal:              ₹46,450.00
Tax (3%):              ₹1,393.50
─────────────────────────────────────────────
New Selling Price:     ₹47,843.50

Current Selling Price: ₹44,290.00
─────────────────────────────────────────────
Difference:            +₹3,553.50 (+8.02%)
```

---

## Frontend Implementation

### New Files Structure

```
admin/src/
├── configs/
│   └── tax.ts                    # NEW: Tax configuration
├── utils/
│   └── pricing-rule-calculator.ts  # NEW: Price calculation logic
└── components/
    └── pricing-rule/
        ├── pricing-rule-create.tsx  # MODIFY: Add applicable products
        ├── pricing-rule-applicable-products.tsx  # NEW
        └── types.ts                 # MODIFY: Add new types
```

### Types

```typescript
// admin/src/components/pricing-rule/types.ts

// Add these new types:

export interface ProductForPricingPreview {
  id: string
  name: string
  base_sku: string
  categories: { id: string }[]
  tags: { id: string }[]
  badges: { id: string }[]
  variants: VariantForPricingPreview[]
}

export interface VariantForPricingPreview {
  id: string
  sku: string
  variant_name: string | null
  price: number  // Current selling price in paise
  price_components: {
    costPrice: {
      metalPrice: number
      makingCharge: number
      diamondPrice: number
      gemstonePrice: number
      pearlPrice: number
      taxAmount: number
      taxIncluded: boolean
    }
  }
  metadata: {
    metalType: string
    metalColor: string
    metalPurity: string
    metalWeight: number
    diamondClarityColor?: string
    weights?: {
      diamond?: { carat: number }
      gemstone?: { carat: number }
    }
  }
}

export interface ApplicableProductResult {
  productId: string
  productName: string
  productSku: string
  variantId: string
  variantSku: string
  variantName: string | null
  currentSellingPrice: number  // In paise
  newSellingPrice: number      // In paise
  priceDifference: number      // In paise
  priceDifferencePercent: number
}
```

### Condition Matching Logic

```typescript
// admin/src/utils/pricing-rule-matcher.ts

import type {
  ProductForPricingPreview,
  VariantForPricingPreview,
  PricingRuleCondition,
  CategoryConditionValue,
  TagsConditionValue,
  BadgesConditionValue,
  MetalWeightConditionValue,
  DiamondCaratConditionValue,
  MetalTypeConditionValue,
  MetalColorConditionValue,
  MetalPurityConditionValue,
  DiamondClarityColorConditionValue,
} from '@/components/pricing-rule/types'

/**
 * Check if a product matches ALL conditions (AND logic)
 */
export function productMatchesConditions(
  product: ProductForPricingPreview,
  variant: VariantForPricingPreview,
  conditions: PricingRuleCondition[]
): boolean {
  // If no conditions, nothing matches
  if (conditions.length === 0) return false

  // ALL conditions must match (AND logic)
  return conditions.every(condition =>
    matchSingleCondition(product, variant, condition)
  )
}

function matchSingleCondition(
  product: ProductForPricingPreview,
  variant: VariantForPricingPreview,
  condition: PricingRuleCondition
): boolean {
  switch (condition.type) {
    case 'category':
      return matchCategory(product, condition.value as CategoryConditionValue)

    case 'tags':
      return matchTags(product, condition.value as TagsConditionValue)

    case 'badges':
      return matchBadges(product, condition.value as BadgesConditionValue)

    case 'metal_weight':
      return matchMetalWeight(variant, condition.value as MetalWeightConditionValue)

    case 'diamond_carat':
      return matchDiamondCarat(variant, condition.value as DiamondCaratConditionValue)

    case 'metal_type':
      return matchMetalType(variant, condition.value as MetalTypeConditionValue)

    case 'metal_color':
      return matchMetalColor(variant, condition.value as MetalColorConditionValue)

    case 'metal_purity':
      return matchMetalPurity(variant, condition.value as MetalPurityConditionValue)

    case 'diamond_clarity_color':
      return matchDiamondClarityColor(variant, condition.value as DiamondClarityColorConditionValue)

    default:
      return false
  }
}

// Category: match by ID
function matchCategory(
  product: ProductForPricingPreview,
  value: CategoryConditionValue
): boolean {
  const productCategoryIds = product.categories.map(c => c.id)

  if (value.matchType === 'all') {
    // Product must have ALL specified categories
    return value.categoryIds.every(id => productCategoryIds.includes(id))
  } else {
    // Product must have ANY of the specified categories
    return value.categoryIds.some(id => productCategoryIds.includes(id))
  }
}

// Tags: match by ID
function matchTags(
  product: ProductForPricingPreview,
  value: TagsConditionValue
): boolean {
  const productTagIds = product.tags.map(t => t.id)

  if (value.matchType === 'all') {
    return value.tagIds.every(id => productTagIds.includes(id))
  } else {
    return value.tagIds.some(id => productTagIds.includes(id))
  }
}

// Badges: match by ID
function matchBadges(
  product: ProductForPricingPreview,
  value: BadgesConditionValue
): boolean {
  const productBadgeIds = product.badges.map(b => b.id)

  if (value.matchType === 'all') {
    return value.badgeIds.every(id => productBadgeIds.includes(id))
  } else {
    return value.badgeIds.some(id => productBadgeIds.includes(id))
  }
}

// Metal Weight: range check (in grams)
function matchMetalWeight(
  variant: VariantForPricingPreview,
  value: MetalWeightConditionValue
): boolean {
  const weight = variant.metadata.metalWeight
  if (weight === undefined || weight === null) return false
  return weight >= value.from && weight <= value.to
}

// Diamond Carat: range check
function matchDiamondCarat(
  variant: VariantForPricingPreview,
  value: DiamondCaratConditionValue
): boolean {
  const carat = variant.metadata.weights?.diamond?.carat
  if (carat === undefined || carat === null) return false
  return carat >= value.from && carat <= value.to
}

// Metal Type: match by slug (any match)
function matchMetalType(
  variant: VariantForPricingPreview,
  value: MetalTypeConditionValue
): boolean {
  const variantMetalType = variant.metadata.metalType
  if (!variantMetalType) return false
  // metalTypeIds contains slugs
  return value.metalTypeIds.includes(variantMetalType)
}

// Metal Color: match by slug (any match)
function matchMetalColor(
  variant: VariantForPricingPreview,
  value: MetalColorConditionValue
): boolean {
  const variantMetalColor = variant.metadata.metalColor
  if (!variantMetalColor) return false
  return value.metalColorIds.includes(variantMetalColor)
}

// Metal Purity: match by slug (any match)
function matchMetalPurity(
  variant: VariantForPricingPreview,
  value: MetalPurityConditionValue
): boolean {
  const variantMetalPurity = variant.metadata.metalPurity
  if (!variantMetalPurity) return false
  return value.metalPurityIds.includes(variantMetalPurity)
}

// Diamond Clarity/Color: match by slug (any match)
function matchDiamondClarityColor(
  variant: VariantForPricingPreview,
  value: DiamondClarityColorConditionValue
): boolean {
  const variantDiamondClarityColor = variant.metadata.diamondClarityColor
  if (!variantDiamondClarityColor) return false
  return value.diamondClarityColorIds.includes(variantDiamondClarityColor)
}
```

### Main Component

```tsx
// admin/src/components/pricing-rule/pricing-rule-applicable-products.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/utils/currency"
import { productMatchesConditions } from "@/utils/pricing-rule-matcher"
import { calculateNewSellingPrice } from "@/utils/pricing-rule-calculator"
import type {
  ProductForPricingPreview,
  PricingRuleCondition,
  PricingRuleActions,
  ApplicableProductResult,
} from "./types"

interface PricingRuleApplicableProductsProps {
  products: ProductForPricingPreview[]
  isLoading: boolean
  conditions: PricingRuleCondition[]
  actions: PricingRuleActions
}

export function PricingRuleApplicableProducts({
  products,
  isLoading,
  conditions,
  actions,
}: PricingRuleApplicableProductsProps) {
  // Calculate applicable products whenever conditions or actions change
  const applicableProducts = useMemo(() => {
    if (conditions.length === 0) return []

    const results: ApplicableProductResult[] = []

    for (const product of products) {
      for (const variant of product.variants) {
        // Check if this variant matches all conditions
        if (productMatchesConditions(product, variant, conditions)) {
          const currentPrice = variant.price
          const costComponents = variant.price_components.costPrice

          // Calculate new price based on cost components + markups
          const newPrice = calculateNewSellingPrice(costComponents, actions)
          const difference = newPrice - currentPrice
          const differencePercent = currentPrice > 0
            ? (difference / currentPrice) * 100
            : 0

          results.push({
            productId: product.id,
            productName: product.name,
            productSku: product.base_sku,
            variantId: variant.id,
            variantSku: variant.sku,
            variantName: variant.variant_name,
            currentSellingPrice: currentPrice,
            newSellingPrice: newPrice,
            priceDifference: difference,
            priceDifferencePercent: differencePercent,
          })
        }
      }
    }

    return results
  }, [products, conditions, actions])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicable Products</CardTitle>
        <CardDescription>
          {conditions.length === 0
            ? "Add conditions to see applicable products"
            : `${applicableProducts.length} variant(s) match the current conditions`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Add at least one condition to preview applicable products
          </div>
        ) : applicableProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products match the current conditions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Product</th>
                  <th className="text-left py-3 px-2 font-medium">Variant</th>
                  <th className="text-right py-3 px-2 font-medium">Current Price</th>
                  <th className="text-right py-3 px-2 font-medium">New Price</th>
                  <th className="text-right py-3 px-2 font-medium">Difference</th>
                </tr>
              </thead>
              <tbody>
                {applicableProducts.map((item) => (
                  <tr key={`${item.productId}-${item.variantId}`} className="border-b">
                    <td className="py-3 px-2">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.productSku}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div>{item.variantName || item.variantSku}</div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatCurrency(item.currentSellingPrice)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      {formatCurrency(item.newSellingPrice)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className={item.priceDifference >= 0 ? "text-green-600" : "text-red-600"}>
                        {item.priceDifference >= 0 ? "+" : ""}
                        {formatCurrency(item.priceDifference)}
                      </div>
                      <div className={`text-xs ${item.priceDifference >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ({item.priceDifferencePercent >= 0 ? "+" : ""}
                        {item.priceDifferencePercent.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Integration in Create Page

```tsx
// admin/src/components/pricing-rule/pricing-rule-create.tsx

// Add to imports:
import { PricingRuleApplicableProducts } from "./pricing-rule-applicable-products"
import type { ProductForPricingPreview } from "./types"

export function PricingRuleCreate() {
  // Existing state...

  // Add new state for products
  const [productsForPreview, setProductsForPreview] = useState<ProductForPricingPreview[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Fetch products on mount (add to existing useEffect or create new one)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true)
        const response = await productService.getAllForPricingPreview()
        setProductsForPreview(response.data)
      } catch (error) {
        console.error("Failed to fetch products for preview:", error)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="space-y-6">
      {/* Existing page header */}

      {/* Existing form card */}

      {/* Add Applicable Products section */}
      <PricingRuleApplicableProducts
        products={productsForPreview}
        isLoading={isLoadingProducts}
        conditions={conditions}  // From existing state
        actions={actions}        // From existing state
      />
    </div>
  )
}
```

---

## UI/UX Design

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back   Add Pricing Rule                                    [Create Rule]  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Rule Details                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Name: [Premium Diamond Rule                    ]                            │
│ Product Type: [Jewellery (Default) ▼]                                       │
│                                                                              │
│ Conditions:                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Category: Any of [Rings, Necklaces]                              [×]    │ │
│ │ Diamond Carat: 0.5 to 2.0                                        [×]    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ [+ Add Condition]                                                           │
│                                                                              │
│ Actions (Markup %):                                                         │
│ Diamond: [20] %    Making Charge: [15] %    Gemstone: [10] %    Pearl: [5] %│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Applicable Products                                                         │
│ 24 variant(s) match the current conditions                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Product              │ Variant          │ Current    │ New        │ Diff     │
├──────────────────────┼──────────────────┼────────────┼────────────┼──────────┤
│ Diamond Ring         │ Gold-18K-VS1     │ ₹44,290.00 │ ₹47,843.50 │ +₹3,553  │
│ RING-001             │                  │            │            │ (+8.02%) │
├──────────────────────┼──────────────────┼────────────┼────────────┼──────────┤
│ Diamond Ring         │ Gold-22K-VS1     │ ₹52,100.00 │ ₹56,268.00 │ +₹4,168  │
│ RING-001             │                  │            │            │ (+8.00%) │
├──────────────────────┼──────────────────┼────────────┼────────────┼──────────┤
│ Ruby Necklace        │ Gold-18K-Premium │ ₹1,25,000  │ ₹1,32,500  │ +₹7,500  │
│ NECK-042             │                  │            │            │ (+6.00%) │
└──────────────────────┴──────────────────┴────────────┴────────────┴──────────┘
```

### Key UI Features

1. **Real-time Updates**: Table updates instantly as conditions/actions change
2. **Color Coding**:
   - Green for price increase (positive difference)
   - Red for price decrease (negative difference)
3. **Empty States**:
   - "Add conditions to see applicable products" (no conditions)
   - "No products match the current conditions" (no matches)
4. **Loading State**: Show spinner while fetching products initially

---

## Implementation Steps

### Step 1: Add Tax Configuration (30 min)

1. [ ] Create `admin/src/configs/tax.ts`
2. [ ] Add tax calculation helper functions
3. [ ] Ensure values match backend config

### Step 2: Create Price Calculator Utility (1 hour)

1. [ ] Create `admin/src/utils/pricing-rule-calculator.ts`
2. [ ] Implement `calculateNewSellingPrice` function
3. [ ] Implement `calculatePriceBreakdown` function
4. [ ] Add unit tests (optional)

### Step 3: Create Condition Matcher Utility (1.5 hours)

1. [ ] Create `admin/src/utils/pricing-rule-matcher.ts`
2. [ ] Implement `productMatchesConditions` function
3. [ ] Implement individual condition matchers
4. [ ] Test with different condition combinations

### Step 4: Add Types (30 min)

1. [ ] Add `ProductForPricingPreview` type
2. [ ] Add `VariantForPricingPreview` type
3. [ ] Add `ApplicableProductResult` type

### Step 5: Create/Update Product Service (1 hour)

1. [ ] Add endpoint for fetching products with required data
2. [ ] OR modify existing endpoint to include variant metadata
3. [ ] Test API response structure

### Step 6: Create Applicable Products Component (2 hours)

1. [ ] Create `pricing-rule-applicable-products.tsx`
2. [ ] Implement product matching logic
3. [ ] Implement price calculation
4. [ ] Add table display
5. [ ] Add loading and empty states

### Step 7: Integrate into Create Page (1 hour)

1. [ ] Add product fetch to `pricing-rule-create.tsx`
2. [ ] Pass state to `PricingRuleApplicableProducts`
3. [ ] Test real-time updates

### Step 8: Testing & Polish (1-2 hours)

1. [ ] Test with various condition combinations
2. [ ] Test edge cases (no conditions, no matches, all matches)
3. [ ] Verify price calculations are correct
4. [ ] Verify tax is applied correctly
5. [ ] UI polish and responsive design

---

## Effort Estimation

| Task | Time |
|------|------|
| Tax configuration | 30 min |
| Price calculator utility | 1 hour |
| Condition matcher utility | 1.5 hours |
| Type definitions | 30 min |
| Product service update | 1 hour |
| Applicable products component | 2 hours |
| Integration in create page | 1 hour |
| Testing & polish | 1-2 hours |
| **Total** | **8-10 hours** |

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `admin/src/configs/tax.ts` | Tax configuration and helpers |
| `admin/src/utils/pricing-rule-calculator.ts` | Price calculation logic |
| `admin/src/utils/pricing-rule-matcher.ts` | Condition matching logic |
| `admin/src/components/pricing-rule/pricing-rule-applicable-products.tsx` | Main display component |

### Modified Files

| File | Changes |
|------|---------|
| `admin/src/components/pricing-rule/types.ts` | Add new types |
| `admin/src/components/pricing-rule/pricing-rule-create.tsx` | Add product fetch and component |
| `admin/src/redux/services/productService.ts` | Add/modify endpoint for preview data |

---

## Notes

### Condition Value Format

The condition matcher expects these ID formats in condition values:

- **Category, Tags, Badges**: Use actual database IDs (ULID format)
- **Metal Type, Color, Purity, Diamond Clarity/Color**: Use **slugs** (stored in variant metadata)

This means the condition form needs to store:
- IDs for category/tags/badges
- Slugs for metal and stone attributes

### Product Data Requirement

The product API must return:
1. All categories, tags, badges linked to the product
2. All variants with their `metadata` and `price_components`
3. The `costPrice` component is essential for calculation

### Performance Note

For stores with 500+ products and multiple variants each, consider:
1. Debouncing the calculation on condition change
2. Using `useMemo` for expensive calculations (already in design)
3. Virtual scrolling for large result tables
