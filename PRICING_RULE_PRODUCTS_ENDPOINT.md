# Pricing Rule Products Endpoint

## Overview

Create a dedicated backend endpoint for fetching products specifically for the Pricing Rule applicable products preview feature. This separates concerns and uses appropriate permissions.

## Current Implementation (Problem)

Currently, the frontend fetches products using:
1. `GET /products` - List all products
2. `GET /products/:id` - Fetch each product's details individually

**Issues:**
- Uses product module permissions (not pricing rule permissions)
- Makes N+1 API calls (1 for list + N for each product detail)
- No dedicated endpoint for this specific use case

## Proposed Solution

### New Endpoint

```
GET /products/for-pricing-rule
```

**Permission:** `pricing_rule:add` (same permission used for creating pricing rules)

### Response Structure

```typescript
{
  success: boolean
  message: string
  data: ProductForPricingPreview[]
}

interface ProductForPricingPreview {
  id: string
  name: string
  base_sku: string
  metadata: {
    media?: {
      colorMedia: ColorMedia[]
    }
  }
  categories: { id: string }[]
  tags: { id: string }[]
  badges: { id: string }[]
  variants: VariantForPricingPreview[]
}

interface VariantForPricingPreview {
  id: string
  sku: string
  variant_name: string | null
  price: number                          // Current selling price (paise)
  price_components: {
    costPrice: {
      metalPrice: number                 // paise
      makingCharge: number               // paise
      diamondPrice: number               // paise
      gemstonePrice: number              // paise
      pearlPrice: number                 // paise
      finalPriceWithoutTax: number
      taxAmount: number
      finalPriceWithTax: number
    }
  }
  metadata: {
    metalType: string                    // slug
    metalColor: string                   // slug
    metalPurity: string                  // slug
    metalWeight: number                  // grams
    diamondClarityColor?: string         // slug
    gemstoneColor?: string               // slug
    weights?: {
      metal?: { grams: number }
      diamond?: { carat: number }
      gemstone?: { carat: number }
      pearl?: { grams?: number }
    }
  }
}
```

## Backend Implementation

### File Structure

```
backend/src/modules/product/
├── routes/
│   └── index.ts                    # Add new route
├── services/
│   └── product.service.ts          # Add new service method (or create dedicated file)
```

### Route Definition

```typescript
// In backend/src/modules/product/routes/index.ts

import { checkPermission } from '../../../middleware/permission'

// New route - uses pricing_rule:add permission
productRoutes.get(
  '/for-pricing-rule',
  authMiddleware,
  checkPermission('pricing_rule', 'add'),
  async (c) => {
    const result = await productService.getProductsForPricingRule()
    return c.json(result)
  }
)
```

### Service Method

```typescript
// In product.service.ts or new file

async getProductsForPricingRule(): Promise<{
  success: boolean
  message: string
  data: ProductForPricingPreview[]
}> {
  // Single optimized query to fetch all required data
  // Join products with categories, tags, badges, and variants

  const query = `
    SELECT
      p.id,
      p.name,
      p.base_sku,
      p.metadata,
      -- Categories as JSON array
      COALESCE(
        (SELECT json_agg(json_build_object('id', pc.category_id))
         FROM product_categories pc
         WHERE pc.product_id = p.id),
        '[]'
      ) as categories,
      -- Tags as JSON array
      COALESCE(
        (SELECT json_agg(json_build_object('id', pt.tag_id))
         FROM product_tags pt
         WHERE pt.product_id = p.id),
        '[]'
      ) as tags,
      -- Badges as JSON array
      COALESCE(
        (SELECT json_agg(json_build_object('id', pb.badge_id))
         FROM product_badges pb
         WHERE pb.product_id = p.id),
        '[]'
      ) as badges,
      -- Variants as JSON array
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', v.id,
            'sku', v.sku,
            'variant_name', v.variant_name,
            'price', v.price,
            'price_components', v.price_components,
            'metadata', v.metadata
          )
        )
         FROM product_variants v
         WHERE v.product_id = p.id),
        '[]'
      ) as variants
    FROM products p
    WHERE p.status = 'active'
    ORDER BY p.name ASC
  `

  const result = await query(sql)

  return {
    success: true,
    message: 'Products fetched successfully',
    data: result.rows
  }
}
```

## Frontend Changes

### Update Product Service

```typescript
// In admin/src/redux/services/productService.ts

// Update the method to use new endpoint
getAllForPricingPreview: async (): Promise<PricingPreviewProductsResponse> => {
  const response = await apiService.get(API_ENDPOINTS.PRODUCT.FOR_PRICING_RULE)
  return response.data
}
```

### Add API Endpoint

```typescript
// In admin/src/redux/api/endpoints.ts

PRODUCT: {
  // ... existing endpoints
  FOR_PRICING_RULE: '/products/for-pricing-rule',
}
```

## Benefits

1. **Single API Call**: One optimized query instead of N+1 calls
2. **Correct Permissions**: Uses `pricing_rule:add` permission, not product permissions
3. **Optimized Response**: Returns only data needed for pricing rule preview
4. **Better Performance**: Database-level JSON aggregation is faster than multiple round trips
5. **Separation of Concerns**: Dedicated endpoint for this specific feature

## Filter Options (Future Enhancement)

Could add query parameters to filter products if the dataset becomes large:

```
GET /products/for-pricing-rule?status=active&limit=100
```

## Notes

- Only fetch `active` products (drafts/archived don't need pricing rules applied)
- The endpoint returns all products at once for frontend processing
- Frontend handles condition matching and price calculation locally
- This matches the current architecture where filtering/calculation is done client-side

## Implementation Order

1. Add route in `backend/src/modules/product/routes/index.ts`
2. Add service method in `backend/src/modules/product/services/product.service.ts`
3. Add endpoint constant in `admin/src/redux/api/endpoints.ts`
4. Update `getAllForPricingPreview` in `admin/src/redux/services/productService.ts`
5. Test the integration
