"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Types
interface Badge {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  parent_id: string | null
}

interface TagGroup {
  id: string
  name: string
}

interface Tag {
  id: string
  tag_group_id: string
  name: string
}

interface AttributesData {
  badgeIds: string[]
  categoryIds: string[]
  tagIds: string[]
}

// Error structure for attributes
export interface AttributesErrors {
  categoryIds?: string
}

interface AttributesSectionProps {
  data: AttributesData
  badges: Badge[]
  categories: Category[]
  tagGroups: TagGroup[]
  tags: Tag[]
  errors?: AttributesErrors
  onChange: (data: AttributesData) => void
}

export function AttributesSection({
  data,
  badges,
  categories,
  tagGroups,
  tags,
  errors = {},
  onChange,
}: AttributesSectionProps) {
  // Get parent categories (no parent_id)
  const parentCategories = categories.filter((c) => c.parent_id === null)

  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return categories.filter((c) => c.parent_id === parentId)
  }

  // Check if any parent category is selected
  const getSelectedParentIds = () => {
    return data.categoryIds.filter((id) => {
      const category = categories.find((c) => c.id === id)
      return category?.parent_id === null
    })
  }

  // Get tags for a tag group
  const getTagsForGroup = (groupId: string) => {
    return tags.filter((t) => t.tag_group_id === groupId)
  }

  // Handle badge toggle
  const handleBadgeToggle = (badgeId: string, checked: boolean) => {
    const newBadgeIds = checked
      ? [...data.badgeIds, badgeId]
      : data.badgeIds.filter((id) => id !== badgeId)
    onChange({ ...data, badgeIds: newBadgeIds })
  }

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    let newCategoryIds: string[]

    if (checked) {
      newCategoryIds = [...data.categoryIds, categoryId]
    } else {
      // If unchecking a parent, also remove its subcategories
      const category = categories.find((c) => c.id === categoryId)
      if (category?.parent_id === null) {
        const subcategoryIds = getSubcategories(categoryId).map((c) => c.id)
        newCategoryIds = data.categoryIds.filter(
          (id) => id !== categoryId && !subcategoryIds.includes(id)
        )
      } else {
        newCategoryIds = data.categoryIds.filter((id) => id !== categoryId)
      }
    }

    onChange({ ...data, categoryIds: newCategoryIds })
  }

  // Handle tag toggle
  const handleTagToggle = (tagId: string, checked: boolean) => {
    const newTagIds = checked
      ? [...data.tagIds, tagId]
      : data.tagIds.filter((id) => id !== tagId)
    onChange({ ...data, tagIds: newTagIds })
  }

  // Check if badge is selected
  const isBadgeSelected = (badgeId: string) => data.badgeIds.includes(badgeId)

  // Check if category is selected
  const isCategorySelected = (categoryId: string) =>
    data.categoryIds.includes(categoryId)

  // Check if tag is selected
  const isTagSelected = (tagId: string) => data.tagIds.includes(tagId)

  return (
    <div className="space-y-6">
      {/* Categories Section - First */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parent Categories */}
          <div className="space-y-3">
            <Label>Select Categories</Label>
            <div className="flex flex-wrap gap-4">
              {parentCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={isCategorySelected(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryToggle(category.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="cursor-pointer font-normal"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.categoryIds && (
              <p className="text-sm text-destructive">{errors.categoryIds}</p>
            )}
          </div>

          {/* Subcategories for selected parent categories */}
          {getSelectedParentIds().map((parentId) => {
            const parent = categories.find((c) => c.id === parentId)
            const subcategories = getSubcategories(parentId)

            if (subcategories.length === 0) return null

            return (
              <Card key={parentId} className="border-muted">
                <CardHeader>
                  <CardTitle className="text-base">
                    {parent?.name} Subcategories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${subcategory.id}`}
                          checked={isCategorySelected(subcategory.id)}
                          onCheckedChange={(checked) =>
                            handleCategoryToggle(subcategory.id, checked === true)
                          }
                        />
                        <Label
                          htmlFor={`category-${subcategory.id}`}
                          className="cursor-pointer font-normal"
                        >
                          {subcategory.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {parentCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No categories available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Badges Section - Second */}
      <Card>
        <CardHeader>
          <CardTitle>Product Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`badge-${badge.id}`}
                  checked={isBadgeSelected(badge.id)}
                  onCheckedChange={(checked) =>
                    handleBadgeToggle(badge.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`badge-${badge.id}`}
                  className="cursor-pointer font-normal"
                >
                  {badge.name}
                </Label>
              </div>
            ))}
          </div>
          {badges.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No badges available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tags Section - Third */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tagGroups.map((group) => {
            const groupTags = getTagsForGroup(group.id)
            if (groupTags.length === 0) return null

            return (
              <div key={group.id} className="space-y-3">
                <Label>{group.name}</Label>
                <div className="flex flex-wrap gap-4">
                  {groupTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={isTagSelected(tag.id)}
                        onCheckedChange={(checked) =>
                          handleTagToggle(tag.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`tag-${tag.id}`}
                        className="cursor-pointer font-normal"
                      >
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {tagGroups.length === 0 && (
            <p className="text-sm text-muted-foreground">No tags available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
