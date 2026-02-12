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
    categoryIds: product.categories.map((cat) => cat.id),
    // Track primary category separately for RadioGroup
    primaryCategoryId: product.categories.find((c) => c.is_primary)?.id || "",
    // Only user-selected tags (system-generated are filtered in product.tags)
    tagIds: product.tags.map((tag) => tag.id),
    // Badges
    badgeIds: product.badges.map((badge) => badge.id),
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
    tags.forEach((tag) => {
      if (!grouped[tag.tag_group_id]) {
        grouped[tag.tag_group_id] = []
      }
      grouped[tag.tag_group_id].push(tag)
    })
    return grouped
  }, [tags])

  // Organize categories into parent-children structure
  const organizedCategories = useMemo(() => {
    const parentCategories = categories.filter((c) => !c.parent_id)
    const childCategories = categories.filter((c) => c.parent_id)

    // Group children by parent_id
    const childrenByParent: Record<string, typeof categories> = {}
    childCategories.forEach((child) => {
      if (child.parent_id) {
        if (!childrenByParent[child.parent_id]) {
          childrenByParent[child.parent_id] = []
        }
        childrenByParent[child.parent_id].push(child)
      }
    })

    return { parentCategories, childrenByParent }
  }, [categories])

  // Fetch dropdown data when drawer opens
  useEffect(() => {
    if (open) {
      dispatch(fetchBadgesForProductEdit())
      dispatch(fetchCategoriesForProductEdit())
      dispatch(fetchTagGroupsForProductEdit())
      dispatch(fetchTagsForProductEdit())

      // Reset form with current product data
      const attrs = extractAttributes(product)
      setSelectedCategoryIds(attrs.categoryIds)
      setPrimaryCategoryId(attrs.primaryCategoryId)
      setSelectedTagIds(attrs.tagIds)
      setSelectedBadgeIds(attrs.badgeIds)
      setCategoryError(null)
    }
  }, [open, dispatch, product])

  // Handle category selection
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategoryIds((prev) => [...prev, categoryId])
      // If this is the first category, make it primary
      if (selectedCategoryIds.length === 0) {
        setPrimaryCategoryId(categoryId)
      }
    } else {
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryId))
      // If removing primary category, clear it or set to another
      if (primaryCategoryId === categoryId) {
        const remaining = selectedCategoryIds.filter((id) => id !== categoryId)
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
      setSelectedTagIds((prev) => [...prev, tagId])
    } else {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
    }
  }

  // Handle badge selection
  const handleBadgeToggle = (badgeId: string, checked: boolean) => {
    if (checked) {
      setSelectedBadgeIds((prev) => [...prev, badgeId])
    } else {
      setSelectedBadgeIds((prev) => prev.filter((id) => id !== badgeId))
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
        categories: selectedCategoryIds.map((id) => ({
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

  const isLoading =
    isLoadingBadges || isLoadingCategories || isLoadingTagGroups || isLoadingTags

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

                <div className="border rounded-lg p-4 space-y-2 max-h-[250px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No categories available
                    </p>
                  ) : (
                    organizedCategories.parentCategories.map((parent) => {
                      const children = organizedCategories.childrenByParent[parent.id] || []
                      const isParentSelected = selectedCategoryIds.includes(parent.id)

                      return (
                        <div key={parent.id} className="space-y-1">
                          {/* Parent Category */}
                          <div className="flex items-center justify-between py-1">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`category-${parent.id}`}
                                checked={isParentSelected}
                                onCheckedChange={(checked) =>
                                  handleCategoryToggle(parent.id, checked === true)
                                }
                              />
                              <Label
                                htmlFor={`category-${parent.id}`}
                                className="cursor-pointer font-medium"
                              >
                                {parent.name}
                              </Label>
                            </div>
                            {isParentSelected && selectedCategoryIds.length > 1 && (
                              <RadioGroup
                                value={primaryCategoryId}
                                onValueChange={handlePrimaryChange}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value={parent.id}
                                    id={`primary-${parent.id}`}
                                  />
                                  <Label
                                    htmlFor={`primary-${parent.id}`}
                                    className="text-xs text-muted-foreground cursor-pointer"
                                  >
                                    Primary
                                  </Label>
                                </div>
                              </RadioGroup>
                            )}
                            {isParentSelected && selectedCategoryIds.length === 1 && (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>

                          {/* Child Categories */}
                          {children.length > 0 && (
                            <div className="ml-6 border-l pl-4 space-y-1">
                              {children.map((child) => {
                                const isChildSelected = selectedCategoryIds.includes(child.id)
                                return (
                                  <div
                                    key={child.id}
                                    className="flex items-center py-1"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Checkbox
                                        id={`category-${child.id}`}
                                        checked={isChildSelected}
                                        onCheckedChange={(checked) =>
                                          handleCategoryToggle(child.id, checked === true)
                                        }
                                      />
                                      <Label
                                        htmlFor={`category-${child.id}`}
                                        className="cursor-pointer text-sm"
                                      >
                                        {child.name}
                                      </Label>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
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
