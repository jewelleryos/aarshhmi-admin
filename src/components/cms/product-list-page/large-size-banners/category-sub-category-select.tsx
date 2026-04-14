'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
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

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium">Categories & Sub-Categories</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Select categories to show this banner on those pages only. Leave unselected for global display.
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-2 max-h-[260px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No categories available
          </p>
        ) : (
          categories.map((cat) => {
            const isCategorySelected = categoryIds.includes(cat.id)
            const activeChildren = (cat.children || []).filter((c) => c.status)

            return (
              <div key={cat.id} className="space-y-1">
                {/* Parent category row */}
                <div className="flex items-center space-x-3 py-1">
                  <Checkbox
                    id={`lsb-cat-${cat.id}`}
                    checked={isCategorySelected}
                    onCheckedChange={(checked) => handleCategoryToggle(cat.id, checked === true)}
                  />
                  <Label htmlFor={`lsb-cat-${cat.id}`} className="cursor-pointer font-medium text-sm">
                    {cat.name}
                  </Label>
                </div>

                {/* Sub-categories (only shown when parent is selected and has children) */}
                {isCategorySelected && activeChildren.length > 0 && (
                  <div className="ml-6 border-l pl-4 space-y-1">
                    {activeChildren.map((sub) => (
                      <div key={sub.id} className="flex items-center space-x-3 py-1">
                        <Checkbox
                          id={`lsb-sub-${sub.id}`}
                          checked={subCategoryIds.includes(sub.id)}
                          onCheckedChange={(checked) => handleSubCategoryToggle(sub.id, checked === true)}
                        />
                        <Label htmlFor={`lsb-sub-${sub.id}`} className="cursor-pointer text-sm">
                          {sub.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {categoryIds.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No categories selected — banner will appear globally
        </p>
      )}
    </div>
  )
}
