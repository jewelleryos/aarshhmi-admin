"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calculator, Loader2, Plus, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAppDispatch } from "@/redux/store"
import { createPricingRule } from "@/redux/slices/pricingRuleSlice"
import {
  CONDITION_CONFIG,
  type PricingRuleCondition,
  type CategoryOption,
  type TagOption,
  type BadgeOption,
  type MetalTypeOption,
  type MetalColorOption,
  type MetalPurityOption,
  type DiamondClarityColorOption,
  type ConditionType,
  type ConditionState,
  type CategoryConditionValue,
  type DiamondCaratConditionValue,
  type TagsConditionValue,
  type MetalWeightConditionValue,
  type BadgesConditionValue,
  type MetalTypeConditionValue,
  type MetalColorConditionValue,
  type MetalPurityConditionValue,
  type DiamondClarityColorConditionValue,
  generateId,
} from "./types"

// Default product type (currently only one)
const DEFAULT_PRODUCT_TYPE = "JEWELLERY_DEFAULT" as const

interface PricingRuleAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: CategoryOption[]
  tags: TagOption[]
  badges: BadgeOption[]
  metalTypes: MetalTypeOption[]
  metalColors: MetalColorOption[]
  metalPurities: MetalPurityOption[]
  diamondClarityColors: DiamondClarityColorOption[]
  onSuccess: () => void
}

// Initial actions state
const initialActions = {
  makingChargeMarkup: 0,
  diamondMarkup: 0,
  gemstoneMarkup: 0,
  pearlMarkup: 0,
}

export function PricingRuleAddDrawer({
  open,
  onOpenChange,
  categories,
  tags,
  badges,
  metalTypes,
  metalColors,
  metalPurities,
  diamondClarityColors,
  onSuccess,
}: PricingRuleAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [conditions, setConditions] = useState<ConditionState[]>([])
  const [actions, setActions] = useState(initialActions)

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    conditions?: string
    actions?: string
  }>({})

  // Get available condition types for the default product type
  const availableConditionTypes = Object.entries(CONDITION_CONFIG)
    .filter(([, config]) => config.allowedProductTypes.includes(DEFAULT_PRODUCT_TYPE))
    .map(([type, config]) => ({ type: type as ConditionType, ...config }))

  // Reset form
  const resetForm = () => {
    setName("")
    setConditions([])
    setActions(initialActions)
    setErrors({})
  }

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Add empty condition box
  const handleAddCondition = () => {
    const newCondition: ConditionState = {
      id: generateId("cond"),
      type: null,
      value: null,
    }
    setConditions([...conditions, newCondition])
  }

  // Remove condition
  const handleRemoveCondition = (conditionId: string) => {
    setConditions(conditions.filter((c) => c.id !== conditionId))
  }

  // Set condition type (when user selects from dropdown)
  const handleSetConditionType = (conditionId: string, type: ConditionType) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId) {
          // Initialize with default value based on type
          let defaultValue: CategoryConditionValue | DiamondCaratConditionValue | TagsConditionValue | MetalWeightConditionValue | BadgesConditionValue | MetalTypeConditionValue | MetalColorConditionValue | MetalPurityConditionValue | DiamondClarityColorConditionValue
          if (type === "category") {
            defaultValue = { matchType: "any", categoryIds: [] }
          } else if (type === "diamond_carat") {
            defaultValue = { from: 0, to: 0 }
          } else if (type === "tags") {
            defaultValue = { matchType: "any", tagIds: [] }
          } else if (type === "metal_weight") {
            defaultValue = { from: 0, to: 0 }
          } else if (type === "badges") {
            defaultValue = { matchType: "any", badgeIds: [] }
          } else if (type === "metal_type") {
            defaultValue = { metalTypeIds: [] }
          } else if (type === "metal_color") {
            defaultValue = { metalColorIds: [] }
          } else if (type === "metal_purity") {
            defaultValue = { metalPurityIds: [] }
          } else {
            defaultValue = { diamondClarityColorIds: [] }
          }
          return { ...c, type, value: defaultValue }
        }
        return c
      })
    )
  }

  // Update category condition
  const updateCategoryCondition = (
    conditionId: string,
    updates: Partial<CategoryConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "category" && c.value) {
          return {
            ...c,
            value: { ...(c.value as CategoryConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update diamond carat condition
  const updateDiamondCaratCondition = (
    conditionId: string,
    updates: Partial<DiamondCaratConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "diamond_carat" && c.value) {
          return {
            ...c,
            value: { ...(c.value as DiamondCaratConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update tags condition
  const updateTagsCondition = (
    conditionId: string,
    updates: Partial<TagsConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "tags" && c.value) {
          return {
            ...c,
            value: { ...(c.value as TagsConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update metal weight condition
  const updateMetalWeightCondition = (
    conditionId: string,
    updates: Partial<MetalWeightConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "metal_weight" && c.value) {
          return {
            ...c,
            value: { ...(c.value as MetalWeightConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update badges condition
  const updateBadgesCondition = (
    conditionId: string,
    updates: Partial<BadgesConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "badges" && c.value) {
          return {
            ...c,
            value: { ...(c.value as BadgesConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update metal type condition
  const updateMetalTypeCondition = (
    conditionId: string,
    updates: Partial<MetalTypeConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "metal_type" && c.value) {
          return {
            ...c,
            value: { ...(c.value as MetalTypeConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update metal color condition
  const updateMetalColorCondition = (
    conditionId: string,
    updates: Partial<MetalColorConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "metal_color" && c.value) {
          return {
            ...c,
            value: { ...(c.value as MetalColorConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update metal purity condition
  const updateMetalPurityCondition = (
    conditionId: string,
    updates: Partial<MetalPurityConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "metal_purity" && c.value) {
          return {
            ...c,
            value: { ...(c.value as MetalPurityConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Update diamond clarity color condition
  const updateDiamondClarityColorCondition = (
    conditionId: string,
    updates: Partial<DiamondClarityColorConditionValue>
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === conditionId && c.type === "diamond_clarity_color" && c.value) {
          return {
            ...c,
            value: { ...(c.value as DiamondClarityColorConditionValue), ...updates },
          }
        }
        return c
      })
    )
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    // Filter out conditions without type selected
    const validConditions = conditions.filter((c) => c.type !== null && c.value !== null)

    if (validConditions.length === 0) {
      newErrors.conditions = "At least one condition is required"
    } else {
      // Validate each condition
      for (const condition of validConditions) {
        if (condition.type === "category") {
          const value = condition.value as CategoryConditionValue
          if (value.categoryIds.length === 0) {
            newErrors.conditions = "Select at least one category for category condition"
            break
          }
        } else if (condition.type === "diamond_carat") {
          const value = condition.value as DiamondCaratConditionValue
          const fromNum = Number(value.from) || 0
          const toNum = Number(value.to) || 0
          if (fromNum < 0 || toNum <= 0) {
            newErrors.conditions = "Invalid carat range"
            break
          }
          if (fromNum >= toNum) {
            newErrors.conditions = "Carat 'from' must be less than 'to'"
            break
          }
        } else if (condition.type === "tags") {
          const value = condition.value as TagsConditionValue
          if (value.tagIds.length === 0) {
            newErrors.conditions = "Select at least one tag for tags condition"
            break
          }
        } else if (condition.type === "metal_weight") {
          const value = condition.value as MetalWeightConditionValue
          const fromNum = Number(value.from) || 0
          const toNum = Number(value.to) || 0
          if (fromNum < 0 || toNum <= 0) {
            newErrors.conditions = "Invalid metal weight range"
            break
          }
          if (fromNum >= toNum) {
            newErrors.conditions = "Metal weight 'from' must be less than 'to'"
            break
          }
        } else if (condition.type === "badges") {
          const value = condition.value as BadgesConditionValue
          if (value.badgeIds.length === 0) {
            newErrors.conditions = "Select at least one badge for badges condition"
            break
          }
        } else if (condition.type === "metal_type") {
          const value = condition.value as MetalTypeConditionValue
          if (value.metalTypeIds.length === 0) {
            newErrors.conditions = "Select at least one metal type"
            break
          }
        } else if (condition.type === "metal_color") {
          const value = condition.value as MetalColorConditionValue
          if (value.metalColorIds.length === 0) {
            newErrors.conditions = "Select at least one metal color"
            break
          }
        } else if (condition.type === "metal_purity") {
          const value = condition.value as MetalPurityConditionValue
          if (value.metalPurityIds.length === 0) {
            newErrors.conditions = "Select at least one metal purity"
            break
          }
        } else if (condition.type === "diamond_clarity_color") {
          const value = condition.value as DiamondClarityColorConditionValue
          if (value.diamondClarityColorIds.length === 0) {
            newErrors.conditions = "Select at least one diamond clarity/color"
            break
          }
        }
      }
    }

    const hasAnyMarkup =
      actions.makingChargeMarkup > 0 ||
      actions.diamondMarkup > 0 ||
      actions.gemstoneMarkup > 0 ||
      actions.pearlMarkup > 0

    if (!hasAnyMarkup) {
      newErrors.actions = "At least one markup percentage must be greater than 0"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      // Convert to final format (only valid conditions, with proper number conversion)
      const finalConditions: PricingRuleCondition[] = validConditions.map((c) => {
        if (c.type === "diamond_carat") {
          const value = c.value as DiamondCaratConditionValue
          return {
            type: c.type,
            value: {
              from: Number(value.from) || 0,
              to: Number(value.to) || 0,
            },
          }
        }
        if (c.type === "metal_weight") {
          const value = c.value as MetalWeightConditionValue
          return {
            type: c.type,
            value: {
              from: Number(value.from) || 0,
              to: Number(value.to) || 0,
            },
          }
        }
        return {
          type: c.type!,
          value: c.value!,
        }
      })

      // Create via API
      const result = await dispatch(
        createPricingRule({
          name: name.trim(),
          product_type: DEFAULT_PRODUCT_TYPE,
          conditions: finalConditions,
          actions,
        })
      ).unwrap()

      toast.success(result.message)
      resetForm()
      onSuccess()
    } catch (err: unknown) {
      const error = err as string
      toast.error(error || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-2xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Pricing Rule</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new rule to calculate selling prices
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Rule Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Premium Diamond Collection"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
            />
            {errors.name && (
              <p className="text-sm text-destructive pl-1">{errors.name}</p>
            )}
          </div>

          <Separator />

          {/* Conditions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Conditions</Label>
                <p className="text-sm text-muted-foreground">
                  Define when this rule should apply
                </p>
              </div>
              {/* Add Condition Button */}
              <Button variant="outline" size="sm" onClick={handleAddCondition}>
                <Plus className="mr-1 h-4 w-4" />
                Add Condition
              </Button>
            </div>

            {errors.conditions && (
              <p className="text-sm text-destructive">{errors.conditions}</p>
            )}

            {/* Empty State */}
            {conditions.length === 0 && (
              <div className="border border-dashed rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No conditions added yet. Click "Add Condition" to get started.
                </p>
              </div>
            )}

            {/* Condition Boxes */}
            {conditions.map((condition) => (
              <div
                key={condition.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Condition Type Select */}
                  <div className="flex-1">
                    <Select
                      value={condition.type || ""}
                      onValueChange={(value) =>
                        handleSetConditionType(condition.id, value as ConditionType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableConditionTypes.map(({ type, label }) => (
                          <SelectItem key={type} value={type}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveCondition(condition.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Category Condition Options */}
                {condition.type === "category" && condition.value && (
                  <div className="space-y-4 pt-2">
                    {/* Match Type */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Match Type
                      </Label>
                      <RadioGroup
                        value={(condition.value as CategoryConditionValue).matchType}
                        onValueChange={(value) =>
                          updateCategoryCondition(condition.id, {
                            matchType: value as "all" | "any",
                          })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="any" id={`${condition.id}-any`} />
                          <Label
                            htmlFor={`${condition.id}-any`}
                            className="font-normal cursor-pointer"
                          >
                            Match ANY category
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id={`${condition.id}-all`} />
                          <Label
                            htmlFor={`${condition.id}-all`}
                            className="font-normal cursor-pointer"
                          >
                            Match ALL categories
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Category Checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Categories
                      </Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {categories.map((category) => {
                          const isChecked = (
                            condition.value as CategoryConditionValue
                          ).categoryIds.includes(category.id)
                          return (
                            <div
                              key={category.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${condition.id}-${category.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentIds = (
                                    condition.value as CategoryConditionValue
                                  ).categoryIds
                                  const newIds = checked
                                    ? [...currentIds, category.id]
                                    : currentIds.filter((id) => id !== category.id)
                                  updateCategoryCondition(condition.id, {
                                    categoryIds: newIds,
                                  })
                                }}
                              />
                              <Label
                                htmlFor={`${condition.id}-${category.id}`}
                                className="font-normal cursor-pointer"
                              >
                                {category.name}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Diamond Carat Condition Options */}
                {condition.type === "diamond_carat" && condition.value && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${condition.id}-from`}>Carat From</Label>
                      <Input
                        id={`${condition.id}-from`}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.000"
                        value={(condition.value as DiamondCaratConditionValue).from}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            updateDiamondCaratCondition(condition.id, {
                              from: value as unknown as number,
                            })
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${condition.id}-to`}>Carat To</Label>
                      <Input
                        id={`${condition.id}-to`}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.000"
                        value={(condition.value as DiamondCaratConditionValue).to}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            updateDiamondCaratCondition(condition.id, {
                              to: value as unknown as number,
                            })
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Tags Condition Options */}
                {condition.type === "tags" && condition.value && (
                  <div className="space-y-4 pt-2">
                    {/* Match Type */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Match Type
                      </Label>
                      <RadioGroup
                        value={(condition.value as TagsConditionValue).matchType}
                        onValueChange={(value) =>
                          updateTagsCondition(condition.id, {
                            matchType: value as "all" | "any",
                          })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="any" id={`${condition.id}-tags-any`} />
                          <Label
                            htmlFor={`${condition.id}-tags-any`}
                            className="font-normal cursor-pointer"
                          >
                            Match ANY tag
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id={`${condition.id}-tags-all`} />
                          <Label
                            htmlFor={`${condition.id}-tags-all`}
                            className="font-normal cursor-pointer"
                          >
                            Match ALL tags
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Tags Checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Tags
                      </Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {tags.map((tag) => {
                          const isChecked = (
                            condition.value as TagsConditionValue
                          ).tagIds.includes(tag.id)
                          return (
                            <div
                              key={tag.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${condition.id}-${tag.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentIds = (
                                    condition.value as TagsConditionValue
                                  ).tagIds
                                  const newIds = checked
                                    ? [...currentIds, tag.id]
                                    : currentIds.filter((id) => id !== tag.id)
                                  updateTagsCondition(condition.id, {
                                    tagIds: newIds,
                                  })
                                }}
                              />
                              <Label
                                htmlFor={`${condition.id}-${tag.id}`}
                                className="font-normal cursor-pointer"
                              >
                                {tag.name}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metal Weight Condition Options */}
                {condition.type === "metal_weight" && condition.value && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${condition.id}-weight-from`}>Weight From (g)</Label>
                      <Input
                        id={`${condition.id}-weight-from`}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.000"
                        value={(condition.value as MetalWeightConditionValue).from}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            updateMetalWeightCondition(condition.id, {
                              from: value as unknown as number,
                            })
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${condition.id}-weight-to`}>Weight To (g)</Label>
                      <Input
                        id={`${condition.id}-weight-to`}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.000"
                        value={(condition.value as MetalWeightConditionValue).to}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            updateMetalWeightCondition(condition.id, {
                              to: value as unknown as number,
                            })
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Badges Condition Options */}
                {condition.type === "badges" && condition.value && (
                  <div className="space-y-4 pt-2">
                    {/* Match Type */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Match Type
                      </Label>
                      <RadioGroup
                        value={(condition.value as BadgesConditionValue).matchType}
                        onValueChange={(value) =>
                          updateBadgesCondition(condition.id, {
                            matchType: value as "all" | "any",
                          })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="any" id={`${condition.id}-badges-any`} />
                          <Label
                            htmlFor={`${condition.id}-badges-any`}
                            className="font-normal cursor-pointer"
                          >
                            Match ANY badge
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id={`${condition.id}-badges-all`} />
                          <Label
                            htmlFor={`${condition.id}-badges-all`}
                            className="font-normal cursor-pointer"
                          >
                            Match ALL badges
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Badges Checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Badges
                      </Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {badges.map((badge) => {
                          const isChecked = (
                            condition.value as BadgesConditionValue
                          ).badgeIds.includes(badge.id)
                          return (
                            <div
                              key={badge.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${condition.id}-${badge.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentIds = (
                                    condition.value as BadgesConditionValue
                                  ).badgeIds
                                  const newIds = checked
                                    ? [...currentIds, badge.id]
                                    : currentIds.filter((id) => id !== badge.id)
                                  updateBadgesCondition(condition.id, {
                                    badgeIds: newIds,
                                  })
                                }}
                              />
                              <Label
                                htmlFor={`${condition.id}-${badge.id}`}
                                className="font-normal cursor-pointer"
                              >
                                {badge.name}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metal Type Condition Options */}
                {condition.type === "metal_type" && condition.value && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm text-muted-foreground">
                      Select Metal Types (matches any)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {metalTypes.map((metalType) => {
                        const isChecked = (
                          condition.value as MetalTypeConditionValue
                        ).metalTypeIds.includes(metalType.id)
                        return (
                          <div
                            key={metalType.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${condition.id}-${metalType.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentIds = (
                                  condition.value as MetalTypeConditionValue
                                ).metalTypeIds
                                const newIds = checked
                                  ? [...currentIds, metalType.id]
                                  : currentIds.filter((id) => id !== metalType.id)
                                updateMetalTypeCondition(condition.id, {
                                  metalTypeIds: newIds,
                                })
                              }}
                            />
                            <Label
                              htmlFor={`${condition.id}-${metalType.id}`}
                              className="font-normal cursor-pointer"
                            >
                              {metalType.name}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Metal Color Condition Options */}
                {condition.type === "metal_color" && condition.value && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm text-muted-foreground">
                      Select Metal Colors (matches any)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {metalColors.map((metalColor) => {
                        const isChecked = (
                          condition.value as MetalColorConditionValue
                        ).metalColorIds.includes(metalColor.id)
                        return (
                          <div
                            key={metalColor.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${condition.id}-${metalColor.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentIds = (
                                  condition.value as MetalColorConditionValue
                                ).metalColorIds
                                const newIds = checked
                                  ? [...currentIds, metalColor.id]
                                  : currentIds.filter((id) => id !== metalColor.id)
                                updateMetalColorCondition(condition.id, {
                                  metalColorIds: newIds,
                                })
                              }}
                            />
                            <Label
                              htmlFor={`${condition.id}-${metalColor.id}`}
                              className="font-normal cursor-pointer"
                            >
                              {metalColor.name}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Metal Purity Condition Options */}
                {condition.type === "metal_purity" && condition.value && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm text-muted-foreground">
                      Select Metal Purities (matches any)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {metalPurities.map((metalPurity) => {
                        const isChecked = (
                          condition.value as MetalPurityConditionValue
                        ).metalPurityIds.includes(metalPurity.id)
                        return (
                          <div
                            key={metalPurity.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${condition.id}-${metalPurity.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentIds = (
                                  condition.value as MetalPurityConditionValue
                                ).metalPurityIds
                                const newIds = checked
                                  ? [...currentIds, metalPurity.id]
                                  : currentIds.filter((id) => id !== metalPurity.id)
                                updateMetalPurityCondition(condition.id, {
                                  metalPurityIds: newIds,
                                })
                              }}
                            />
                            <Label
                              htmlFor={`${condition.id}-${metalPurity.id}`}
                              className="font-normal cursor-pointer"
                            >
                              {metalPurity.name}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Diamond Clarity Color Condition Options */}
                {condition.type === "diamond_clarity_color" && condition.value && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm text-muted-foreground">
                      Select Diamond Clarity/Colors (matches any)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {diamondClarityColors.map((clarityColor) => {
                        const isChecked = (
                          condition.value as DiamondClarityColorConditionValue
                        ).diamondClarityColorIds.includes(clarityColor.id)
                        return (
                          <div
                            key={clarityColor.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${condition.id}-${clarityColor.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentIds = (
                                  condition.value as DiamondClarityColorConditionValue
                                ).diamondClarityColorIds
                                const newIds = checked
                                  ? [...currentIds, clarityColor.id]
                                  : currentIds.filter((id) => id !== clarityColor.id)
                                updateDiamondClarityColorCondition(condition.id, {
                                  diamondClarityColorIds: newIds,
                                })
                              }}
                            />
                            <Label
                              htmlFor={`${condition.id}-${clarityColor.id}`}
                              className="font-normal cursor-pointer"
                            >
                              {clarityColor.name}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Actions Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Markup Percentages</Label>
              <p className="text-sm text-muted-foreground">
                Define the markup to apply on each cost component
              </p>
            </div>

            {errors.actions && (
              <p className="text-sm text-destructive">{errors.actions}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Making Charge Markup */}
              <div className="space-y-2">
                <Label htmlFor="makingChargeMarkup">Making Charge</Label>
                <div className="relative">
                  <Input
                    id="makingChargeMarkup"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="pr-8"
                    value={actions.makingChargeMarkup || ""}
                    onChange={(e) =>
                      setActions((prev) => ({
                        ...prev,
                        makingChargeMarkup: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Diamond Markup */}
              <div className="space-y-2">
                <Label htmlFor="diamondMarkup">Diamond</Label>
                <div className="relative">
                  <Input
                    id="diamondMarkup"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="pr-8"
                    value={actions.diamondMarkup || ""}
                    onChange={(e) =>
                      setActions((prev) => ({
                        ...prev,
                        diamondMarkup: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Gemstone Markup */}
              <div className="space-y-2">
                <Label htmlFor="gemstoneMarkup">Gemstone</Label>
                <div className="relative">
                  <Input
                    id="gemstoneMarkup"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="pr-8"
                    value={actions.gemstoneMarkup || ""}
                    onChange={(e) =>
                      setActions((prev) => ({
                        ...prev,
                        gemstoneMarkup: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Pearl Markup */}
              <div className="space-y-2">
                <Label htmlFor="pearlMarkup">Pearl</Label>
                <div className="relative">
                  <Input
                    id="pearlMarkup"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="pr-8"
                    value={actions.pearlMarkup || ""}
                    onChange={(e) =>
                      setActions((prev) => ({
                        ...prev,
                        pearlMarkup: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Rule"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
