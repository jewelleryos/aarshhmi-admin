# Product Attributes Edit Drawer - Implementation Plan

## Overview

This document outlines the implementation plan for the Product Attributes Edit Drawer feature. This allows editing of product categories, tags, and badges from the product detail view.

---

## Current State Analysis

### Existing Product Attributes Structure

**ProductDetail Response:**
```typescript
{
  categories: ProductCategory[]  // { id, name, slug, is_primary }
  tags: ProductTag[]            // { id, name, slug, tag_group_id, tag_group_name }
  badges: ProductBadge[]        // { id, name, slug, bg_color, font_color }
}
```

### Existing Database Tables (Junction Tables)

| Table | Fields | Constraints |
|-------|--------|-------------|
| `product_categories` | product_id, category_id, is_primary | PRIMARY KEY (product_id, category_id) |
| `product_tags` | product_id, tag_id | PRIMARY KEY (product_id, tag_id) |
| `product_badges` | product_id, badge_id | PRIMARY KEY (product_id, badge_id) |

### Existing Backend Routes

| Module | Route | Permission | Purpose |
|--------|-------|------------|---------|
| Badges | `/api/badges/for-product` | PRODUCT.CREATE | Product creation dropdown |
| Categories | `/api/categories/for-product` | PRODUCT.CREATE | Product creation dropdown |
| Tag Groups | `/api/tag-groups/for-product` | PRODUCT.CREATE | Product creation dropdown |
| Tags | `/api/tags/for-product` | PRODUCT.CREATE | Product creation dropdown |

---

## Implementation Tasks

### Phase 1: Backend - Add Dropdown Routes for Edit

**Why separate routes?** The existing `/for-product` routes use `PRODUCT.CREATE` permission. For editing, we need routes with `PRODUCT.UPDATE` permission.

#### Task 1.1: Add Badge Route for Product Edit

**File:** `/backend/src/modules/badges/routes/badges.routes.ts`

Add new route after `/for-product`:
```typescript
// GET /api/badges/for-product-edit - Get badges for product edit dropdown
// Uses PRODUCT.UPDATE permission for editing products
badgeRoutes.get('/for-product-edit', authWithPermission(PERMISSIONS.PRODUCT.UPDATE), async (c) => {
  try {
    const result = await badgeService.getForProduct()
    return successResponse(c, 'Badges fetched successfully', { items: result })
  } catch (error) {
    return errorHandler(error, c)
  }
})
```

#### Task 1.2: Add Category Route for Product Edit

**File:** `/backend/src/modules/categories/routes/categories.routes.ts`

Add new route after `/for-product`:
```typescript
// GET /api/categories/for-product-edit - Get categories for product edit dropdown
// Uses PRODUCT.UPDATE permission for editing products
categoryRoutes.get('/for-product-edit', authWithPermission(PERMISSIONS.PRODUCT.UPDATE), async (c) => {
  try {
    const result = await categoryService.getForProduct()
    return successResponse(c, 'Categories fetched successfully', { items: result })
  } catch (error) {
    return errorHandler(error, c)
  }
})
```

#### Task 1.3: Add Tag Group Route for Product Edit

**File:** `/backend/src/modules/tag-groups/routes/tag-groups.routes.ts`

Add new route after `/for-product`:
```typescript
// GET /api/tag-groups/for-product-edit - Get tag groups for product edit dropdown
// Uses PRODUCT.UPDATE permission for editing products
tagGroupRoutes.get('/for-product-edit', authWithPermission(PERMISSIONS.PRODUCT.UPDATE), async (c) => {
  try {
    const result = await tagGroupService.getForProduct()
    return successResponse(c, 'Tag groups fetched successfully', { items: result })
  } catch (error) {
    return errorHandler(error, c)
  }
})
```

#### Task 1.4: Add Tag Route for Product Edit

**File:** `/backend/src/modules/tags/routes/tags.routes.ts`

Add new route after `/for-product`:
```typescript
// GET /api/tags/for-product-edit - Get tags for product edit dropdown
// Uses PRODUCT.UPDATE permission for editing products
tagRoutes.get('/for-product-edit', authWithPermission(PERMISSIONS.PRODUCT.UPDATE), async (c) => {
  try {
    const result = await tagService.getForProduct()
    return successResponse(c, 'Tags fetched successfully', { items: result })
  } catch (error) {
    return errorHandler(error, c)
  }
})
```

---

### Phase 2: Backend - Create Update Attributes API

#### Task 2.1: Add Zod Schema for Attributes Update

**File:** `/backend/src/modules/product/config/jewellery-default.schema.ts`

Add new schema:
```typescript
// Update attributes schema
export const jewelleryDefaultUpdateAttributesSchema = z.object({
  // Categories - array of category IDs with one marked as primary
  categories: z.array(z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    isPrimary: z.boolean(),
  })).min(1, 'At least one category is required')
    .refine(
      (cats) => cats.filter(c => c.isPrimary).length === 1,
      'Exactly one category must be marked as primary'
    ),

  // Tags - array of tag IDs (user-selected, non-system tags)
  tagIds: z.array(z.string()).default([]),

  // Badges - array of badge IDs
  badgeIds: z.array(z.string()).default([]),
})

export type JewelleryDefaultUpdateAttributesInput = z.infer<typeof jewelleryDefaultUpdateAttributesSchema>
```

#### Task 2.2: Add Messages for Attributes Update

**File:** `/backend/src/modules/product/config/product.messages.ts`

Add new message:
```typescript
ATTRIBUTES_UPDATED: 'Product attributes updated successfully',
```

#### Task 2.3: Add Update Attributes Service Method

**File:** `/backend/src/modules/product/services/jewellery-default.service.ts`

Add new method:
```typescript
/**
 * Update product attributes (categories, tags, badges)
 * Simple approach: Delete all and re-insert
 * Preserves system-generated tags
 */
async updateAttributes(productId: string, data: JewelleryDefaultUpdateAttributesInput) {
  try {
    // 1. Verify product exists
    const productResult = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    )

    if (productResult.rows.length === 0) {
      throw new AppError(productMessages.NOT_FOUND, 404)
    }

    // 2. Update categories (delete all and re-insert)
    await db.query('DELETE FROM product_categories WHERE product_id = $1', [productId])

    if (data.categories.length > 0) {
      const categoryValues = data.categories
        .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
        .join(', ')
      const categoryParams: (string | boolean)[] = [productId]
      data.categories.forEach(cat => {
        categoryParams.push(cat.categoryId, cat.isPrimary)
      })

      await db.query(
        `INSERT INTO product_categories (product_id, category_id, is_primary)
         VALUES ${categoryValues}`,
        categoryParams
      )
    }

    // 3. Update tags (only user-selected tags, preserve system-generated)
    // Delete only user-selected (non-system) tags
    await db.query(
      `DELETE FROM product_tags
       WHERE product_id = $1
       AND tag_id IN (
         SELECT t.id FROM tags t WHERE t.is_system_generated = false
       )`,
      [productId]
    )

    // Insert new user-selected tags
    if (data.tagIds.length > 0) {
      const tagValues = data.tagIds
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ')
      await db.query(
        `INSERT INTO product_tags (product_id, tag_id)
         VALUES ${tagValues}`,
        [productId, ...data.tagIds]
      )
    }

    // 4. Update badges (delete all and re-insert)
    await db.query('DELETE FROM product_badges WHERE product_id = $1', [productId])

    if (data.badgeIds.length > 0) {
      const badgeValues = data.badgeIds
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ')
      await db.query(
        `INSERT INTO product_badges (product_id, badge_id)
         VALUES ${badgeValues}`,
        [productId, ...data.badgeIds]
      )
    }

    // 5. Update product's updated_at timestamp
    await db.query(
      'UPDATE products SET updated_at = NOW() WHERE id = $1',
      [productId]
    )

    return {
      id: productId,
      categoriesCount: data.categories.length,
      tagsCount: data.tagIds.length,
      badgesCount: data.badgeIds.length,
    }
  } catch (error) {
    throw error
  }
}
```

#### Task 2.4: Add Update Attributes Route

**File:** `/backend/src/modules/product/routes/product.routes.ts`

Add new route after `/api/products/:id/basic`:
```typescript
import { jewelleryDefaultUpdateAttributesSchema } from '../config/jewellery-default.schema'

// PATCH /api/products/:id/attributes - Update product attributes
productRoutes.patch('/:id/attributes', authWithPermission(PERMISSIONS.PRODUCT.UPDATE), async (c) => {
  try {
    const { id } = c.req.param()
    const body = await c.req.json()

    // First, get the product to determine its type
    const product = await productService.getById(id)
    if (!product) {
      throw new AppError(productMessages.NOT_FOUND, 404)
    }

    // Route to appropriate service based on product type
    let result
    switch (product.product_type) {
      case PRODUCT_TYPES.JEWELLERY_DEFAULT.code: {
        // Validate request body with schema
        const validatedData = jewelleryDefaultUpdateAttributesSchema.parse(body)
        result = await jewelleryDefaultService.updateAttributes(id, validatedData)
        break
      }

      default:
        throw new AppError(productMessages.INVALID_PRODUCT_TYPE, 400)
    }

    return successResponse(c, productMessages.ATTRIBUTES_UPDATED, result)
  } catch (error) {
    return errorHandler(error, c)
  }
})
```

---

### Phase 3: Frontend - API Integration

#### Task 3.1: Add Endpoints for Product Edit Dropdowns

**File:** `/admin/src/redux/api/endpoints.ts`

Add to PRODUCT section:
```typescript
PRODUCT: {
  // ... existing endpoints
  // Attributes dropdown endpoints for edit
  BADGES_FOR_EDIT: '/api/badges/for-product-edit',
  CATEGORIES_FOR_EDIT: '/api/categories/for-product-edit',
  TAG_GROUPS_FOR_EDIT: '/api/tag-groups/for-product-edit',
  TAGS_FOR_EDIT: '/api/tags/for-product-edit',
  // Update attributes endpoint
  UPDATE_ATTRIBUTES: (id: string) => `/api/products/${id}/attributes`,
}
```

#### Task 3.2: Add Service Methods for Edit Dropdowns

**File:** `/admin/src/redux/services/productService.ts`

Add new type and methods:
```typescript
// Update attributes request type
export interface UpdateAttributesRequest {
  categories: {
    categoryId: string
    isPrimary: boolean
  }[]
  tagIds: string[]
  badgeIds: string[]
}

// Update attributes response
interface UpdateAttributesResponse {
  success: boolean
  message: string
  data: {
    id: string
    categoriesCount: number
    tagsCount: number
    badgesCount: number
  }
}

// Add to productService object:
const productService = {
  // ... existing methods

  // Get badges for product edit dropdown
  getBadgesForEdit: async (): Promise<DropdownResponse<BadgeDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.BADGES_FOR_EDIT)
    return response.data
  },

  // Get categories for product edit dropdown
  getCategoriesForEdit: async (): Promise<DropdownResponse<CategoryDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.CATEGORIES_FOR_EDIT)
    return response.data
  },

  // Get tag groups for product edit dropdown
  getTagGroupsForEdit: async (): Promise<DropdownResponse<TagGroupDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.TAG_GROUPS_FOR_EDIT)
    return response.data
  },

  // Get tags for product edit dropdown
  getTagsForEdit: async (): Promise<DropdownResponse<TagDropdownItem>> => {
    const response = await apiService.get(API_ENDPOINTS.PRODUCT.TAGS_FOR_EDIT)
    return response.data
  },

  // Update product attributes
  updateAttributes: async (id: string, data: UpdateAttributesRequest): Promise<UpdateAttributesResponse> => {
    const response = await apiService.patch(API_ENDPOINTS.PRODUCT.UPDATE_ATTRIBUTES(id), data)
    return response.data
  },
}
```

#### Task 3.3: Add Redux Thunks for Edit Dropdowns

**File:** `/admin/src/redux/slices/productSlice.ts`

Add new thunks:
```typescript
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
```

Add to extraReducers (these reuse the same state as create dropdowns since data is identical):
```typescript
// Badges for edit
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
// Categories for edit
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
// Tag groups for edit
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
// Tags for edit
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
```

---

### Phase 4: Frontend - Attributes Edit Drawer Component

#### Task 4.1: Create Attributes Edit Drawer Component

**File:** `/admin/src/components/products/edit/attributes-edit-drawer.tsx`

```typescript
"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Tags } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  fetchBadgesForProductEdit,
  fetchCategoriesForProductEdit,
  fetchTagGroupsForProductEdit,
  fetchTagsForProductEdit,
} from "@/redux/slices/productSlice"
import productService, { UpdateAttributesRequest } from "@/redux/services/productService"
import type { ProductDetail } from "@/redux/services/productService"

interface AttributesEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductDetail
  onSuccess: () => void
}

// Extract attributes from product
function extractAttributes(product: ProductDetail) {
  return {
    // Categories with primary flag
    categories: product.categories.map(cat => ({
      id: cat.id,
      isPrimary: cat.is_primary,
    })),
    // Only user-selected tags (system-generated are filtered in product.tags)
    tagIds: product.tags.map(tag => tag.id),
    // Badges
    badgeIds: product.badges.map(badge => badge.id),
    // Track primary category separately for RadioGroup
    primaryCategoryId: product.categories.find(c => c.is_primary)?.id || "",
  }
}

export function AttributesEditDrawer({
  open,
  onOpenChange,
  product,
  onSuccess,
}: AttributesEditDrawerProps) {
  const dispatch = useAppDispatch()
  const {
    badges,
    categories,
    tagGroups,
    tags,
    isLoadingBadges,
    isLoadingCategories,
    isLoadingTagGroups,
    isLoadingTags,
  } = useAppSelector((state) => state.product)

  // Form state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Errors
  const [categoryError, setCategoryError] = useState<string | null>(null)

  // Group tags by tag group
  const tagsByGroup = useMemo(() => {
    const grouped: Record<string, typeof tags> = {}
    tags.forEach(tag => {
      if (!grouped[tag.tag_group_id]) {
        grouped[tag.tag_group_id] = []
      }
      grouped[tag.tag_group_id].push(tag)
    })
    return grouped
  }, [tags])

  // Fetch dropdown data when drawer opens
  useEffect(() => {
    if (open) {
      dispatch(fetchBadgesForProductEdit())
      dispatch(fetchCategoriesForProductEdit())
      dispatch(fetchTagGroupsForProductEdit())
      dispatch(fetchTagsForProductEdit())

      // Reset form with current product data
      const attrs = extractAttributes(product)
      setSelectedCategoryIds(attrs.categories.map(c => c.id))
      setPrimaryCategoryId(attrs.primaryCategoryId)
      setSelectedTagIds(attrs.tagIds)
      setSelectedBadgeIds(attrs.badgeIds)
      setCategoryError(null)
    }
  }, [open, dispatch, product])

  // Handle category selection
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategoryIds(prev => [...prev, categoryId])
      // If this is the first category, make it primary
      if (selectedCategoryIds.length === 0) {
        setPrimaryCategoryId(categoryId)
      }
    } else {
      setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId))
      // If removing primary category, clear it or set to another
      if (primaryCategoryId === categoryId) {
        const remaining = selectedCategoryIds.filter(id => id !== categoryId)
        setPrimaryCategoryId(remaining[0] || "")
      }
    }
    setCategoryError(null)
  }

  // Handle primary category change
  const handlePrimaryChange = (categoryId: string) => {
    setPrimaryCategoryId(categoryId)
  }

  // Handle tag selection
  const handleTagToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, tagId])
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId))
    }
  }

  // Handle badge selection
  const handleBadgeToggle = (badgeId: string, checked: boolean) => {
    if (checked) {
      setSelectedBadgeIds(prev => [...prev, badgeId])
    } else {
      setSelectedBadgeIds(prev => prev.filter(id => id !== badgeId))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    if (selectedCategoryIds.length === 0) {
      setCategoryError("At least one category is required")
      return false
    }
    if (!primaryCategoryId || !selectedCategoryIds.includes(primaryCategoryId)) {
      setCategoryError("A primary category must be selected")
      return false
    }
    return true
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const requestData: UpdateAttributesRequest = {
        categories: selectedCategoryIds.map(id => ({
          categoryId: id,
          isPrimary: id === primaryCategoryId,
        })),
        tagIds: selectedTagIds,
        badgeIds: selectedBadgeIds,
      }

      const response = await productService.updateAttributes(product.id, requestData)
      toast.success(response.message)
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isLoadingBadges || isLoadingCategories || isLoadingTagGroups || isLoadingTags

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Attributes</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update categories, tags, and badges for this product
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Categories Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">
                    Categories <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select categories and mark one as primary
                  </p>
                </div>

                <div className="border rounded-lg p-4 space-y-3 max-h-[200px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No categories available
                    </p>
                  ) : (
                    categories.map((category) => {
                      const isSelected = selectedCategoryIds.includes(category.id)
                      return (
                        <div
                          key={category.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleCategoryToggle(category.id, checked === true)
                              }
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="cursor-pointer"
                            >
                              {category.name}
                              {category.parent_id && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  (child)
                                </span>
                              )}
                            </Label>
                          </div>
                          {isSelected && selectedCategoryIds.length > 1 && (
                            <RadioGroup
                              value={primaryCategoryId}
                              onValueChange={handlePrimaryChange}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={category.id}
                                  id={`primary-${category.id}`}
                                />
                                <Label
                                  htmlFor={`primary-${category.id}`}
                                  className="text-xs text-muted-foreground cursor-pointer"
                                >
                                  Primary
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                          {isSelected && selectedCategoryIds.length === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {categoryError && (
                  <p className="text-sm text-destructive">{categoryError}</p>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Tags</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select tags to associate with this product
                  </p>
                </div>

                <div className="border rounded-lg p-4 space-y-6 max-h-[300px] overflow-y-auto">
                  {tagGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No tag groups available
                    </p>
                  ) : (
                    tagGroups.map((group) => {
                      const groupTags = tagsByGroup[group.id] || []
                      if (groupTags.length === 0) return null

                      return (
                        <div key={group.id} className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            {group.name}
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {groupTags.map((tag) => {
                              const isSelected = selectedTagIds.includes(tag.id)
                              return (
                                <Badge
                                  key={tag.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => handleTagToggle(tag.id, !isSelected)}
                                >
                                  {tag.name}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Badges Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Badges</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select badges to display on this product
                  </p>
                </div>

                <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                  {badges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No badges available
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge) => {
                        const isSelected = selectedBadgeIds.includes(badge.id)
                        return (
                          <Badge
                            key={badge.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleBadgeToggle(badge.id, !isSelected)}
                          >
                            {badge.name}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

---

### Phase 5: Frontend - Integration with Product View

#### Task 5.1: Add Edit Button and Drawer to JewelleryDefaultView

**File:** `/admin/src/components/products/views/jewellery-default-view.tsx`

1. Import the drawer component:
```typescript
import { AttributesEditDrawer } from "../edit/attributes-edit-drawer"
```

2. Add state for drawer:
```typescript
const [isAttributesDrawerOpen, setIsAttributesDrawerOpen] = useState(false)
```

3. Add edit button to Attributes section header (around line 803):
```typescript
{/* Attributes Section */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-lg">Attributes</CardTitle>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsAttributesDrawerOpen(true)}
    >
      <Pencil className="h-4 w-4 mr-2" />
      Edit
    </Button>
  </CardHeader>
  <CardContent>
    {/* ... existing content ... */}
  </CardContent>
</Card>
```

4. Add drawer component at the end of the component:
```typescript
{/* Attributes Edit Drawer */}
<AttributesEditDrawer
  open={isAttributesDrawerOpen}
  onOpenChange={setIsAttributesDrawerOpen}
  product={product}
  onSuccess={onProductUpdate}
/>
```

---

## File Changes Summary

### Backend Files to Modify

| File | Change |
|------|--------|
| `/backend/src/modules/badges/routes/badges.routes.ts` | Add `/for-product-edit` route |
| `/backend/src/modules/categories/routes/categories.routes.ts` | Add `/for-product-edit` route |
| `/backend/src/modules/tag-groups/routes/tag-groups.routes.ts` | Add `/for-product-edit` route |
| `/backend/src/modules/tags/routes/tags.routes.ts` | Add `/for-product-edit` route |
| `/backend/src/modules/product/config/jewellery-default.schema.ts` | Add `jewelleryDefaultUpdateAttributesSchema` |
| `/backend/src/modules/product/config/product.messages.ts` | Add `ATTRIBUTES_UPDATED` message |
| `/backend/src/modules/product/services/jewellery-default.service.ts` | Add `updateAttributes` method |
| `/backend/src/modules/product/routes/product.routes.ts` | Add `PATCH /:id/attributes` route |

### Frontend Files to Modify

| File | Change |
|------|--------|
| `/admin/src/redux/api/endpoints.ts` | Add edit dropdown endpoints and update attributes endpoint |
| `/admin/src/redux/services/productService.ts` | Add service methods for edit dropdowns and update attributes |
| `/admin/src/redux/slices/productSlice.ts` | Add thunks and reducers for edit dropdowns |
| `/admin/src/components/products/views/jewellery-default-view.tsx` | Add edit button and drawer integration |

### Frontend Files to Create

| File | Purpose |
|------|---------|
| `/admin/src/components/products/edit/attributes-edit-drawer.tsx` | Attributes edit drawer component |

---

## Key Implementation Notes

### 1. Primary Category Logic
- At least one category must be selected
- Exactly one category must be marked as primary
- When only one category is selected, it's automatically primary
- When multiple categories are selected, user can choose which is primary

### 2. System-Generated Tags Preservation
- When updating, DELETE only affects user-selected tags (`is_system_generated = false`)
- System tags remain untouched in `product_tags` table

### 3. Multi-Select UI Pattern
- Categories: Checkboxes with radio buttons for primary selection
- Tags: Clickable badges grouped by tag group
- Badges: Clickable badges in a flex wrap container

### 4. Permission Model
- `/for-product` endpoints use `PRODUCT.CREATE` permission
- `/for-product-edit` endpoints use `PRODUCT.UPDATE` permission
- Update attributes endpoint uses `PRODUCT.UPDATE` permission

---

## Testing Checklist

### Dropdown Routes
- [ ] All four dropdown endpoints return data with PRODUCT.UPDATE permission
- [ ] Existing `/for-product` routes still work with PRODUCT.CREATE permission

### UI Functionality
- [ ] Drawer opens and shows loading state
- [ ] Dropdown data populates correctly
- [ ] Existing product attributes are pre-selected
- [ ] Category selection/deselection works
- [ ] Primary category switching works
- [ ] At least one category validation works
- [ ] Primary category validation works
- [ ] Tag selection/deselection works
- [ ] Tags display grouped by tag group
- [ ] Badge selection/deselection works

### Backend
- [ ] Categories updated correctly
- [ ] Tags updated correctly (user-selected only)
- [ ] System-generated tags preserved after update
- [ ] Badges updated correctly

### Integration
- [ ] Submit updates product attributes
- [ ] Success toast shows backend message
- [ ] Error toast shows backend message
- [ ] Product view refreshes after successful update
