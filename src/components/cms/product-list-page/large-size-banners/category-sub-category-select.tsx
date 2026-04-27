'use client'

import { useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, Loader2 } from 'lucide-react'
import { cmsService, type CategoryWithChildrenForSelect } from '../../services/cmsService'

interface CategorySubCategorySelectProps {
  categoryIds: string[]
  subCategoryIds: string[]
  onCategoryIdsChange: (ids: string[]) => void
  onSubCategoryIdsChange: (ids: string[]) => void
}

export function CategorySubCategorySelect({
  categoryIds,
  subCategoryIds,
  onCategoryIdsChange,
  onSubCategoryIdsChange,
}: CategorySubCategorySelectProps) {
  const [categories, setCategories] = useState<CategoryWithChildrenForSelect[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [subDropdownOpen, setSubDropdownOpen] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [subSearch, setSubSearch] = useState('')

  const catDropdownRef = useRef<HTMLDivElement>(null)
  const subDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const response = await cmsService.getCategoriesTree()
        const allCategories = response.data?.items || []
        setCategories(allCategories.filter((c) => c.status))
      } catch {
        // silently fail — list stays empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false)
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target as Node)) {
        setSubDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      onCategoryIdsChange([...categoryIds, categoryId])
    } else {
      onCategoryIdsChange(categoryIds.filter((id) => id !== categoryId))
      // Remove any sub-categories that belong to this category
      const category = categories.find((c) => c.id === categoryId)
      if (category?.children?.length) {
        const childIds = category.children.map((c) => c.id)
        onSubCategoryIdsChange(subCategoryIds.filter((id) => !childIds.includes(id)))
      }
    }
  }

  const handleSubCategoryToggle = (subCategoryId: string, checked: boolean) => {
    if (checked) {
      onSubCategoryIdsChange([...subCategoryIds, subCategoryId])
    } else {
      onSubCategoryIdsChange(subCategoryIds.filter((id) => id !== subCategoryId))
    }
  }

  // Flatten subcategories for the subcategories dropdown
  const allSubCategories = categories.flatMap((cat) =>
    (cat.children || []).filter((c) => c.status).map((sub) => ({
      ...sub,
      parentId: cat.id,
      parentName: cat.name,
    }))
  )

  const filteredParents = categories.filter(
    (c) => !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  const filteredSubs = allSubCategories.filter((s) => {
    if (!categoryIds.includes(s.parentId)) return false
    if (!subSearch) return true
    return (
      s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.parentName.toLowerCase().includes(subSearch.toLowerCase())
    )
  })

  // Group filtered subs by parent
  const subGroups: { parentId: string; parentName: string; subs: typeof filteredSubs }[] = []
  filteredSubs.forEach((sub) => {
    const existing = subGroups.find((g) => g.parentId === sub.parentId)
    if (existing) existing.subs.push(sub)
    else subGroups.push({ parentId: sub.parentId, parentName: sub.parentName, subs: [sub] })
  })

  const selectedCatCount = categories.filter((c) => categoryIds.includes(c.id)).length
  const selectedSubCount = subCategoryIds.length
  const hasParentsWithSubs = allSubCategories.some((s) => categoryIds.includes(s.parentId))

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Categories & Sub-Categories</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Select categories to show this banner on those pages only. Leave unselected for global display.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Categories Dropdown */}
          <div ref={catDropdownRef} className="relative">
            <Label className="text-sm font-medium mb-1.5 block">Categories</Label>
            <button
              type="button"
              onClick={() => { setCatDropdownOpen((v) => !v); setSubDropdownOpen(false) }}
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted/30"
            >
              <span className="text-muted-foreground">
                {selectedCatCount > 0 ? `${selectedCatCount} selected` : 'Select categories...'}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
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
                  {filteredParents.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No categories found</p>
                  ) : (
                    filteredParents.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCategoryToggle(cat.id, !categoryIds.includes(cat.id))}
                      >
                        <Checkbox
                          checked={categoryIds.includes(cat.id)}
                          onCheckedChange={(checked) => handleCategoryToggle(cat.id, checked === true)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm flex-1">{cat.name}</span>
                      </div>
                    ))
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
                {selectedSubCount > 0
                  ? `${selectedSubCount} selected`
                  : hasParentsWithSubs
                  ? 'Select subcategories...'
                  : 'Select a category first'}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${subDropdownOpen ? 'rotate-180' : ''}`} />
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
                  {subGroups.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No subcategories found</p>
                  ) : (
                    subGroups.map((group) => (
                      <div key={group.parentId}>
                        <div className="px-3 pt-2 pb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.parentName}
                          </span>
                        </div>
                        {group.subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 pl-5 pr-3 py-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleSubCategoryToggle(sub.id, !subCategoryIds.includes(sub.id))}
                          >
                            <Checkbox
                              checked={subCategoryIds.includes(sub.id)}
                              onCheckedChange={(checked) => handleSubCategoryToggle(sub.id, checked === true)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm flex-1">{sub.name}</span>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </>
      )}

      {categoryIds.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No categories selected — banner will appear globally
        </p>
      )}
    </div>
  )
}
