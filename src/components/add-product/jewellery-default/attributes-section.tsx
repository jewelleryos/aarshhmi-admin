"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Star } from "lucide-react"

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
  primaryCategoryId: string | null
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
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [subDropdownOpen, setSubDropdownOpen] = useState(false)
  const [catSearch, setCatSearch] = useState("")
  const [subSearch, setSubSearch] = useState("")

  const catDropdownRef = useRef<HTMLDivElement>(null)
  const subDropdownRef = useRef<HTMLDivElement>(null)

  // Parent categories and subcategories
  const parentCategories = categories.filter((c) => c.parent_id === null)
  const subCategories = categories.filter((c) => c.parent_id !== null)
  const parentMap: Record<string, string> = {}
  parentCategories.forEach((p) => { parentMap[p.id] = p.name })

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

  // Get tags for a tag group
  const getTagsForGroup = (groupId: string) => tags.filter((t) => t.tag_group_id === groupId)

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
      newCategoryIds = data.categoryIds.filter((id) => id !== categoryId)
    }
    const newPrimaryId =
      data.primaryCategoryId && newCategoryIds.includes(data.primaryCategoryId)
        ? data.primaryCategoryId
        : newCategoryIds[0] ?? null
    onChange({ ...data, categoryIds: newCategoryIds, primaryCategoryId: newPrimaryId })
  }

  // Handle tag toggle
  const handleTagToggle = (tagId: string, checked: boolean) => {
    const newTagIds = checked
      ? [...data.tagIds, tagId]
      : data.tagIds.filter((id) => id !== tagId)
    onChange({ ...data, tagIds: newTagIds })
  }

  const isBadgeSelected = (badgeId: string) => data.badgeIds.includes(badgeId)
  const isCategorySelected = (categoryId: string) => data.categoryIds.includes(categoryId)
  const isTagSelected = (tagId: string) => data.tagIds.includes(tagId)

  const selectedParentCount = parentCategories.filter((p) => isCategorySelected(p.id)).length
  const selectedSubCount = subCategories.filter((s) => isCategorySelected(s.id)).length

  const filteredParents = catSearch
    ? parentCategories.filter((p) => p.name.toLowerCase().includes(catSearch.toLowerCase()))
    : parentCategories

  // Only show subcategories whose parent is selected
  const relevantSubs = subCategories.filter((s) => s.parent_id && data.categoryIds.includes(s.parent_id))

  const filteredSubs = subSearch
    ? relevantSubs.filter((s) => {
        const parentName = s.parent_id ? parentMap[s.parent_id] || "" : ""
        return (
          s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
          parentName.toLowerCase().includes(subSearch.toLowerCase())
        )
      })
    : relevantSubs

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Categories
            {data.categoryIds.length > 0 && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({data.categoryIds.length} selected)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary indicator */}
          {data.primaryCategoryId && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-3 py-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Primary:&nbsp;
                {(() => {
                  const cat = categories.find((c) => c.id === data.primaryCategoryId)
                  if (!cat) return "—"
                  const parent = cat.parent_id ? parentMap[cat.parent_id] : null
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
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <span className="text-muted-foreground">
                {selectedParentCount > 0 ? `${selectedParentCount} selected` : "Select categories..."}
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
                  {filteredParents.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No categories found</p>
                  ) : (
                    filteredParents.map((parent) => (
                      <div
                        key={parent.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCategoryToggle(parent.id, !isCategorySelected(parent.id))}
                      >
                        <Checkbox
                          checked={isCategorySelected(parent.id)}
                          onCheckedChange={(checked) => handleCategoryToggle(parent.id, checked === true)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm flex-1">{parent.name}</span>
                        {isCategorySelected(parent.id) && (
                          <button
                            type="button"
                            title={data.primaryCategoryId === parent.id ? "Primary" : "Set as primary"}
                            onClick={(e) => { e.stopPropagation(); onChange({ ...data, primaryCategoryId: parent.id }) }}
                            className="shrink-0"
                          >
                            <Star className={`h-3.5 w-3.5 transition-colors ${data.primaryCategoryId === parent.id ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"}`} />
                          </button>
                        )}
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
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <span className="text-muted-foreground">
                {selectedSubCount > 0
                  ? `${selectedSubCount} selected`
                  : relevantSubs.length > 0
                  ? "Select subcategories..."
                  : "Select a category first"}
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
                  {filteredSubs.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No subcategories found</p>
                  ) : (
                    (() => {
                      // Group filtered subs by parent
                      const groups: { parentId: string; parentName: string; subs: typeof filteredSubs }[] = []
                      filteredSubs.forEach((sub) => {
                        const pid = sub.parent_id || ""
                        const pname = pid ? (parentMap[pid] || "Other") : "Other"
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
                              onClick={() => handleCategoryToggle(sub.id, !isCategorySelected(sub.id))}
                            >
                              <Checkbox
                                checked={isCategorySelected(sub.id)}
                                onCheckedChange={(checked) => handleCategoryToggle(sub.id, checked === true)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm flex-1">{sub.name}</span>
                              {isCategorySelected(sub.id) && (
                                <button
                                  type="button"
                                  title={data.primaryCategoryId === sub.id ? "Primary" : "Set as primary"}
                                  onClick={(e) => { e.stopPropagation(); onChange({ ...data, primaryCategoryId: sub.id }) }}
                                  className="shrink-0"
                                >
                                  <Star className={`h-3.5 w-3.5 transition-colors ${data.primaryCategoryId === sub.id ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"}`} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ))
                    })()
                  )}
                </ScrollArea>
              </div>
            )}
          </div>

          {errors.categoryIds && (
            <p className="text-sm text-destructive">{errors.categoryIds}</p>
          )}
        </CardContent>
      </Card>

      {/* Badges Section */}
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

      {/* Tags Section */}
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
