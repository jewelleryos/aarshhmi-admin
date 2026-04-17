"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Loader2, Tags, ChevronDown, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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

  // Dropdown open states
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [subDropdownOpen, setSubDropdownOpen] = useState(false)
  const [catSearch, setCatSearch] = useState("")
  const [subSearch, setSubSearch] = useState("")

  // Refs for click-outside
  const catDropdownRef = useRef<HTMLDivElement>(null)
  const subDropdownRef = useRef<HTMLDivElement>(null)

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

  // Organize categories into parent/subcategory lists
  const organizedCategories = useMemo(() => {
    const parentCategories = categories.filter((c) => !c.parent_id)
    const subCategories = categories.filter((c) => !!c.parent_id)
    const parentMap: Record<string, string> = {}
    parentCategories.forEach((p) => { parentMap[p.id] = p.name })
    return { parentCategories, subCategories, parentMap }
  }, [categories])

  // Click-outside close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false)
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target as Node)) {
        setSubDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold">
                    Categories <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select categories and subcategories, then mark one as primary
                  </p>
                </div>

                {/* Primary indicator */}
                {primaryCategoryId && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-3 py-2">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Primary:&nbsp;
                      {(() => {
                        const cat = categories.find((c) => c.id === primaryCategoryId)
                        if (!cat) return "—"
                        const parent = cat.parent_id ? organizedCategories.parentMap[cat.parent_id] : null
                        return parent ? `${parent} › ${cat.name}` : cat.name
                      })()}
                    </span>
                  </div>
                )}

                {/* Categories Dropdown */}
                <div ref={catDropdownRef} className="relative">
                  <Label className="text-sm font-medium mb-1.5 block">Categories</Label>
                  <button
                    type="button"
                    onClick={() => { setCatDropdownOpen((v) => !v); setSubDropdownOpen(false) }}
                    className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted/30"
                  >
                    <span className="text-muted-foreground">
                      {organizedCategories.parentCategories.filter((p) => selectedCategoryIds.includes(p.id)).length > 0
                        ? `${organizedCategories.parentCategories.filter((p) => selectedCategoryIds.includes(p.id)).length} selected`
                        : "Select categories..."}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${catDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {catDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Search categories..."
                          value={catSearch}
                          onChange={(e) => setCatSearch(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      <ScrollArea className="max-h-48">
                        {organizedCategories.parentCategories
                          .filter((p) => !catSearch || p.name.toLowerCase().includes(catSearch.toLowerCase()))
                          .map((parent) => (
                            <div
                              key={parent.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleCategoryToggle(parent.id, !selectedCategoryIds.includes(parent.id))}
                            >
                              <Checkbox
                                checked={selectedCategoryIds.includes(parent.id)}
                                onCheckedChange={(checked) => handleCategoryToggle(parent.id, checked === true)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm flex-1">{parent.name}</span>
                              {selectedCategoryIds.includes(parent.id) && (
                                <button
                                  type="button"
                                  title={primaryCategoryId === parent.id ? "Primary" : "Set as primary"}
                                  onClick={(e) => { e.stopPropagation(); handlePrimaryChange(parent.id) }}
                                  className="shrink-0"
                                >
                                  <Star className={`h-3.5 w-3.5 transition-colors ${primaryCategoryId === parent.id ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"}`} />
                                </button>
                              )}
                            </div>
                          ))}
                        {organizedCategories.parentCategories.filter((p) => !catSearch || p.name.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                          <p className="py-4 text-center text-sm text-muted-foreground">No categories found</p>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Subcategories Dropdown */}
                <div ref={subDropdownRef} className="relative">
                  <Label className="text-sm font-medium mb-1.5 block">Subcategories</Label>
                  <button
                    type="button"
                    onClick={() => { setSubDropdownOpen((v) => !v); setCatDropdownOpen(false) }}
                    className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted/30"
                  >
                    <span className="text-muted-foreground">
                      {(() => {
                        const selCount = organizedCategories.subCategories.filter((s) => selectedCategoryIds.includes(s.id)).length
                        if (selCount > 0) return `${selCount} selected`
                        const hasParents = organizedCategories.subCategories.some((s) => s.parent_id && selectedCategoryIds.includes(s.parent_id))
                        return hasParents ? "Select subcategories..." : "Select a category first"
                      })()}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${subDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {subDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Search subcategories..."
                          value={subSearch}
                          onChange={(e) => setSubSearch(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      <ScrollArea className="max-h-48">
                        {(() => {
                          const filtered = organizedCategories.subCategories.filter((s) => {
                            // Only show subcategories whose parent is selected
                            if (!s.parent_id || !selectedCategoryIds.includes(s.parent_id)) return false
                            if (!subSearch) return true
                            const pname = organizedCategories.parentMap[s.parent_id] || ""
                            return (
                              s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
                              pname.toLowerCase().includes(subSearch.toLowerCase())
                            )
                          })
                          if (filtered.length === 0) {
                            return <p className="py-4 text-center text-sm text-muted-foreground">No subcategories found</p>
                          }
                          // Group by parent
                          const groups: { parentId: string; parentName: string; subs: typeof filtered }[] = []
                          filtered.forEach((sub) => {
                            const pid = sub.parent_id || ""
                            const pname = pid ? (organizedCategories.parentMap[pid] || "Other") : "Other"
                            const existing = groups.find((g) => g.parentId === pid)
                            if (existing) existing.subs.push(sub)
                            else groups.push({ parentId: pid, parentName: pname, subs: [sub] })
                          })
                          return groups.map((group) => (
                            <div key={group.parentId}>
                              <div className="px-3 pt-2 pb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.parentName}</span>
                              </div>
                              {group.subs.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-2 pl-5 pr-3 py-2 hover:bg-muted/50 cursor-pointer"
                                  onClick={() => handleCategoryToggle(sub.id, !selectedCategoryIds.includes(sub.id))}
                                >
                                  <Checkbox
                                    checked={selectedCategoryIds.includes(sub.id)}
                                    onCheckedChange={(checked) => handleCategoryToggle(sub.id, checked === true)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="text-sm flex-1">{sub.name}</span>
                                  {selectedCategoryIds.includes(sub.id) && (
                                    <button
                                      type="button"
                                      title={primaryCategoryId === sub.id ? "Primary" : "Set as primary"}
                                      onClick={(e) => { e.stopPropagation(); handlePrimaryChange(sub.id) }}
                                      className="shrink-0"
                                    >
                                      <Star className={`h-3.5 w-3.5 transition-colors ${primaryCategoryId === sub.id ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"}`} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))
                        })()}
                      </ScrollArea>
                    </div>
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
