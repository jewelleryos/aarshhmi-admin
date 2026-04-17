"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Ticket, Loader2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch } from "@/redux/store"
import { createCoupon } from "@/redux/slices/couponSlice"
import couponService from "@/redux/services/couponService"
import type { CouponTypeDefinition, CouponCondition } from "./types"
import {
  CONDITION_FIELD_LABELS,
  CONDITION_OPERATORS,
  NUMERIC_CONDITION_FIELDS,
  MULTI_SELECT_CONDITION_FIELDS,
} from "./types"

interface ConditionState {
  id: string
  field: string
  operator: string
  value: string        // for numeric fields
  selectedIds: string[] // for multi-select fields
}

interface DropdownOption {
  id: string
  name: string
}

// Map condition field to its fetcher
const CONDITION_FIELD_FETCHERS: Record<string, (svc: typeof couponService) => Promise<any>> = {
  product_category: (svc) => svc.getCategories(),
  metal_type: (svc) => svc.getMetalTypes(),
  metal_color: (svc) => svc.getMetalColors(),
  metal_purity: (svc) => svc.getMetalPurities(),
  diamond_clarity_color: (svc) => svc.getDiamondClarityColors(),
  gemstone_color: (svc) => svc.getGemstoneColors(),
  tag: (svc) => svc.getTags(),
}

let conditionIdCounter = 0
function generateConditionId(): string {
  conditionIdCounter += 1
  return `cond_${Date.now()}_${conditionIdCounter}`
}

export function CouponCreate() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Coupon types from API
  const [couponTypes, setCouponTypes] = useState<CouponTypeDefinition[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)

  // Selected type
  const [selectedType, setSelectedType] = useState<CouponTypeDefinition | null>(null)

  // Form state
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [displayText, setDisplayText] = useState("")

  // Discount fields
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat")
  const [discountValue, setDiscountValue] = useState("") // Rs input for flat
  const [discountPercent, setDiscountPercent] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("") // Rs input for percentage cap
  const [maxDiscountPerProduct, setMaxDiscountPerProduct] = useState("")

  // Conditions
  const [conditions, setConditions] = useState<ConditionState[]>([])
  const [conditionOptions, setConditionOptions] = useState<Record<string, DropdownOption[]>>({})
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // Limits & Validity
  const [minCartValue, setMinCartValue] = useState("") // Rs input
  const [validFrom, setValidFrom] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [usageLimit, setUsageLimit] = useState("")

  // Terms & Conditions
  const [termsAndConditions, setTermsAndConditions] = useState("")

  // Customer targeting (for customer_specific type)
  const [emailInputs, setEmailInputs] = useState<string[]>([])
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])
  const [customerOptions, setCustomerOptions] = useState<{ id: string; email: string | null; first_name: string | null; last_name: string | null }[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

  // Settings
  const [isActive, setIsActive] = useState(true)
  const [guestAllowed, setGuestAllowed] = useState(true)
  const [showOnStorefront, setShowOnStorefront] = useState(true)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch coupon types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await couponService.getTypes()
        setCouponTypes(response.data.types)
      } catch (error) {
        console.error("Failed to fetch coupon types:", error)
        toast.error("Failed to load coupon types")
      } finally {
        setIsLoadingTypes(false)
      }
    }
    fetchTypes()
  }, [])

  // Fetch dropdown options for multi-select condition fields
  const fetchConditionOptions = async (type: CouponTypeDefinition) => {
    const multiSelectFields = type.availableConditions.filter((f) =>
      MULTI_SELECT_CONDITION_FIELDS.has(f)
    )
    if (multiSelectFields.length === 0) return

    setIsLoadingOptions(true)
    try {
      const results: Record<string, DropdownOption[]> = {}
      await Promise.all(
        multiSelectFields.map(async (field) => {
          const fetcher = CONDITION_FIELD_FETCHERS[field]
          if (fetcher) {
            const res = await fetcher(couponService)
            results[field] = res.data?.items || []
          }
        })
      )
      setConditionOptions(results)
    } catch (error) {
      console.error("Failed to fetch condition options:", error)
      toast.error("Failed to load condition options")
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // When a type is selected, apply fixed behaviors
  const handleSelectType = (type: CouponTypeDefinition) => {
    setSelectedType(type)
    setErrors({})
    setConditions([])

    // Reset discount fields
    setDiscountType("flat")
    setDiscountValue("")
    setDiscountPercent("")
    setMaxDiscount("")
    setMaxDiscountPerProduct("")

    // Reset customer targeting fields
    setEmailInputs([])
    setSelectedCustomerIds([])
    setCustomerOptions([])

    // Apply fixed behaviors
    if (type.fixedBehaviors.guestAllowed !== undefined) {
      setGuestAllowed(type.fixedBehaviors.guestAllowed)
    } else {
      setGuestAllowed(true)
    }
    if (type.fixedBehaviors.showOnStorefront !== undefined) {
      setShowOnStorefront(type.fixedBehaviors.showOnStorefront)
    } else {
      setShowOnStorefront(true)
    }

    // Fetch dropdown options for multi-select fields
    fetchConditionOptions(type)

    // Fetch customers for customer_specific type
    if (type.requiresCustomerEmails) {
      setIsLoadingCustomers(true)
      couponService.getCustomers()
        .then((res) => setCustomerOptions(res.data?.items || []))
        .catch(() => toast.error("Failed to load customers"))
        .finally(() => setIsLoadingCustomers(false))
    }
  }

  // Condition helpers
  const handleAddCondition = () => {
    if (!selectedType) return
    const availableFields = selectedType.availableConditions.filter(
      (field) => !conditions.some((c) => c.field === field)
    )
    if (availableFields.length === 0) {
      toast.error("All available conditions have been added")
      return
    }
    const field = availableFields[0]
    const operators = CONDITION_OPERATORS[field] || []
    setConditions([
      ...conditions,
      {
        id: generateConditionId(),
        field,
        operator: operators[0]?.value || ">=",
        value: "",
        selectedIds: [],
      },
    ])
  }

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id))
  }

  const handleConditionFieldChange = (id: string, newField: string) => {
    const operators = CONDITION_OPERATORS[newField] || []
    setConditions(
      conditions.map((c) =>
        c.id === id
          ? { ...c, field: newField, operator: operators[0]?.value || ">=", value: "", selectedIds: [] }
          : c
      )
    )
  }

  const handleConditionOperatorChange = (id: string, operator: string) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, operator } : c))
    )
  }

  const handleConditionValueChange = (id: string, value: string) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, value } : c))
    )
  }

  const handleConditionToggleId = (condId: string, optionId: string, checked: boolean) => {
    setConditions(
      conditions.map((c) => {
        if (c.id !== condId) return c
        const newIds = checked
          ? [...c.selectedIds, optionId]
          : c.selectedIds.filter((sid) => sid !== optionId)
        return { ...c, selectedIds: newIds }
      })
    )
  }

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedType) {
      toast.error("Please select a coupon type")
      return false
    }

    if (!code.trim()) {
      newErrors.code = "Code is required"
    }

    // Discount validation based on type
    const mode = selectedType.discountMode
    if (mode === "flat") {
      if (!discountValue || Number(discountValue) <= 0) {
        newErrors.discountValue = "Discount amount is required"
      }
    } else if (mode === "percentage") {
      if (!discountPercent || Number(discountPercent) <= 0 || Number(discountPercent) > 100) {
        newErrors.discountPercent = "Valid percentage (0.01-100) is required"
      }
      if (!maxDiscount || Number(maxDiscount) <= 0) {
        newErrors.maxDiscount = "Max discount cap is required"
      }
    } else if (mode === "configurable") {
      if (discountType === "flat") {
        if (!discountValue || Number(discountValue) <= 0) {
          newErrors.discountValue = "Discount amount is required"
        }
      } else {
        if (!discountPercent || Number(discountPercent) <= 0 || Number(discountPercent) > 100) {
          newErrors.discountPercent = "Valid percentage (0.01-100) is required"
        }
        if (!maxDiscount || Number(maxDiscount) <= 0) {
          newErrors.maxDiscount = "Max discount cap is required"
        }
      }
    }

    // Condition values
    for (const cond of conditions) {
      if (MULTI_SELECT_CONDITION_FIELDS.has(cond.field)) {
        if (cond.selectedIds.length === 0) {
          newErrors[`condition_${cond.id}`] = "Select at least one option"
        }
      } else {
        if (!cond.value.trim()) {
          newErrors[`condition_${cond.id}`] = "Value is required"
        }
      }
    }

    // Date range validation
    if (validFrom && validUntil) {
      if (new Date(validUntil) <= new Date(validFrom)) {
        newErrors.validUntil = "Valid Until must be after Valid From"
      }
    }

    // Usage limit validation
    if (usageLimit) {
      const limit = Number(usageLimit)
      if (!Number.isInteger(limit) || limit < 1) {
        newErrors.usageLimit = "Usage limit must be a positive whole number"
      }
    }

    // Customer targeting validation
    if (selectedType.requiresCustomerEmails) {
      const emails = emailInputs.map((e) => e.trim()).filter(Boolean)
      if (emails.length === 0 && selectedCustomerIds.length === 0) {
        newErrors.customerTargeting = "At least one customer email or customer is required"
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      for (const email of emails) {
        if (!emailRegex.test(email)) {
          newErrors.customerTargeting = `Invalid email format: ${email}`
          break
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async () => {
    if (!validate() || !selectedType) return

    setIsSubmitting(true)

    try {
      const mode = selectedType.discountMode
      const payload: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        type: selectedType.code,
        description: description.trim() || null,
        display_text: displayText.trim() || null,
        is_active: isActive,
        guest_allowed: guestAllowed,
        show_on_storefront: showOnStorefront,
        min_cart_value: minCartValue ? Math.round(Number(minCartValue) * 100) : null,
        valid_from: validFrom ? new Date(validFrom).toISOString() : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        metadata: {
          terms_and_conditions: termsAndConditions.trim() || null,
        },
      }

      // Discount fields based on mode
      if (mode === "flat") {
        payload.discount_value = Math.round(Number(discountValue) * 100)
      } else if (mode === "percentage") {
        payload.discount_percent = Number(discountPercent)
        payload.max_discount = Math.round(Number(maxDiscount) * 100)
        if (selectedType.targetLevel === "product" && maxDiscountPerProduct) {
          payload.max_discount_per_product = Math.round(Number(maxDiscountPerProduct) * 100)
        }
      } else if (mode === "configurable") {
        payload.discount_type = discountType
        if (discountType === "flat") {
          payload.discount_value = Math.round(Number(discountValue) * 100)
        } else {
          payload.discount_percent = Number(discountPercent)
          payload.max_discount = Math.round(Number(maxDiscount) * 100)
          if (maxDiscountPerProduct) {
            payload.max_discount_per_product = Math.round(Number(maxDiscountPerProduct) * 100)
          }
        }
      }

      // Customer targeting
      if (selectedType.requiresCustomerEmails) {
        const emails = emailInputs.map((e) => e.trim().toLowerCase()).filter(Boolean)
        if (emails.length > 0) {
          payload.assigned_customer_emails = emails
        }
        if (selectedCustomerIds.length > 0) {
          ;(payload.metadata as Record<string, unknown>).assigned_customer_ids = selectedCustomerIds
        }
      }

      // Conditions
      if (conditions.length > 0) {
        payload.conditions = conditions
          .filter((c) => {
            if (MULTI_SELECT_CONDITION_FIELDS.has(c.field)) return c.selectedIds.length > 0
            return c.value.trim() !== ""
          })
          .map((c): CouponCondition => {
            if (MULTI_SELECT_CONDITION_FIELDS.has(c.field)) {
              return { field: c.field, operator: c.operator, value: c.selectedIds }
            }
            // Numeric: convert Rs to paise for cart_subtotal and unit_price
            let value: string | number = c.value.trim()
            if (c.field === "cart_subtotal" || c.field === "unit_price") {
              value = Math.round(Number(value) * 100)
            } else if (c.field === "item_count") {
              value = Number(value)
            }
            return { field: c.field, operator: c.operator, value }
          })
      }

      const result = await dispatch(createCoupon(payload)).unwrap()
      toast.success(result.message || "Coupon created successfully")
      router.push("/coupons")
    } catch (error: any) {
      toast.error(error || "Failed to create coupon")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoadingTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/coupons")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Coupon</h1>
              <p className="text-muted-foreground">
                Create a new discount coupon for your store
              </p>
            </div>
          </div>
        </div>
        {selectedType && (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Coupon"
            )}
          </Button>
        )}
      </div>

      {/* Step 1: Type Selector */}
      {!selectedType && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-1">Choose Coupon Type</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select the type of discount you want to create
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {couponTypes.map((type) => (
                <button
                  key={type.code}
                  type="button"
                  className="flex flex-col items-start gap-1 rounded-lg border p-4 text-left hover:border-primary hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectType(type)}
                >
                  <span className="font-medium">{type.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Coupon Form */}
      {selectedType && (
        <>
          {/* Selected Type Banner */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Coupon Type</p>
                  <p className="font-semibold">{selectedType.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedType.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedType(null)
                    setErrors({})
                  }}
                >
                  Change Type
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Sections */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Section A: Basic Details */}
              <div>
                <h3 className="text-base font-semibold mb-4">Basic Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Coupon Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="code"
                      placeholder="e.g., SAVE500"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase())
                        if (errors.code) {
                          setErrors(({ code: _, ...rest }) => rest)
                        }
                      }}
                      maxLength={50}
                    />
                    {errors.code && (
                      <p className="text-sm text-destructive">{errors.code}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayText">Display Text</Label>
                    <Input
                      id="displayText"
                      placeholder="e.g., Get Rs.500 off on your order!"
                      value={displayText}
                      onChange={(e) => setDisplayText(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Internal notes about this coupon..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Section B: Discount Configuration */}
              <div>
                <h3 className="text-base font-semibold mb-4">Discount Configuration</h3>

                {/* Configurable mode: show flat/percentage selector */}
                {selectedType.discountMode === "configurable" && (
                  <div className="space-y-2 mb-4">
                    <Label>Discount Type</Label>
                    <Select
                      value={discountType}
                      onValueChange={(v) => {
                        setDiscountType(v as "flat" | "percentage")
                        setDiscountValue("")
                        setDiscountPercent("")
                        setMaxDiscount("")
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Flat fields */}
                {(selectedType.discountMode === "flat" ||
                  (selectedType.discountMode === "configurable" && discountType === "flat")) && (
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Discount Amount (Rs.) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g., 500"
                      value={discountValue}
                      onChange={(e) => {
                        setDiscountValue(e.target.value)
                        if (errors.discountValue) {
                          setErrors(({ discountValue: _, ...rest }) => rest)
                        }
                      }}
                      className="w-48"
                    />
                    {errors.discountValue && (
                      <p className="text-sm text-destructive">{errors.discountValue}</p>
                    )}
                  </div>
                )}

                {/* Percentage fields */}
                {(selectedType.discountMode === "percentage" ||
                  (selectedType.discountMode === "configurable" && discountType === "percentage")) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="discountPercent">
                        Discount Percentage (%) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="discountPercent"
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        placeholder="e.g., 10"
                        value={discountPercent}
                        onChange={(e) => {
                          setDiscountPercent(e.target.value)
                          if (errors.discountPercent) {
                            setErrors(({ discountPercent: _, ...rest }) => rest)
                          }
                        }}
                        className="w-48"
                      />
                      {errors.discountPercent && (
                        <p className="text-sm text-destructive">{errors.discountPercent}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscount">
                        Max Discount Cap (Rs.) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g., 2000"
                        value={maxDiscount}
                        onChange={(e) => {
                          setMaxDiscount(e.target.value)
                          if (errors.maxDiscount) {
                            setErrors(({ maxDiscount: _, ...rest }) => rest)
                          }
                        }}
                        className="w-48"
                      />
                      {errors.maxDiscount && (
                        <p className="text-sm text-destructive">{errors.maxDiscount}</p>
                      )}
                    </div>
                    {(selectedType.targetLevel === "product" ||
                      selectedType.availableConditions.some((f) => MULTI_SELECT_CONDITION_FIELDS.has(f))) && (
                      <div className="space-y-2">
                        <Label htmlFor="maxDiscountPerProduct">
                          Max Discount Per Product (Rs.)
                        </Label>
                        <Input
                          id="maxDiscountPerProduct"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Optional"
                          value={maxDiscountPerProduct}
                          onChange={(e) => setMaxDiscountPerProduct(e.target.value)}
                          className="w-48"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Section D: Conditions */}
              {selectedType.availableConditions.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold">Conditions</h3>
                        <p className="text-sm text-muted-foreground">
                          Optional rules that must be met for the coupon to apply
                        </p>
                      </div>
                      {conditions.length < selectedType.availableConditions.length && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddCondition}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Condition
                        </Button>
                      )}
                    </div>

                    {conditions.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No conditions added. The coupon will apply without restrictions.
                      </p>
                    )}

                    <div className="space-y-3">
                      {conditions.map((cond) => {
                        const availableFields = selectedType.availableConditions.filter(
                          (f) => f === cond.field || !conditions.some((c) => c.id !== cond.id && c.field === f)
                        )
                        const operators = CONDITION_OPERATORS[cond.field] || []
                        const isNumeric = NUMERIC_CONDITION_FIELDS.has(cond.field)
                        const isMultiSelect = MULTI_SELECT_CONDITION_FIELDS.has(cond.field)
                        const options = conditionOptions[cond.field] || []

                        return (
                          <div key={cond.id} className="rounded-lg border p-3 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                                <Select
                                  value={cond.field}
                                  onValueChange={(v) => handleConditionFieldChange(cond.id, v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFields.map((f) => (
                                      <SelectItem key={f} value={f}>
                                        {CONDITION_FIELD_LABELS[f] || f}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={cond.operator}
                                  onValueChange={(v) => handleConditionOperatorChange(cond.id, v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operators.map((op) => (
                                      <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Numeric input for cart_subtotal, item_count, unit_price */}
                                {isNumeric && (
                                  <div className="space-y-1">
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder={
                                        cond.field === "cart_subtotal" || cond.field === "unit_price"
                                          ? "Amount in Rs."
                                          : "Number of items"
                                      }
                                      value={cond.value}
                                      onChange={(e) => handleConditionValueChange(cond.id, e.target.value)}
                                    />
                                    {errors[`condition_${cond.id}`] && (
                                      <p className="text-xs text-destructive">
                                        {errors[`condition_${cond.id}`]}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Selected count for multi-select */}
                                {isMultiSelect && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    {cond.selectedIds.length > 0
                                      ? `${cond.selectedIds.length} selected`
                                      : "None selected"}
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveCondition(cond.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Checkbox grid for multi-select fields */}
                            {isMultiSelect && (
                              <div className="space-y-1">
                                {isLoadingOptions ? (
                                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading options...
                                  </div>
                                ) : options.length === 0 ? (
                                  <p className="text-sm text-muted-foreground italic py-2">
                                    No options available
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                                    {options.map((opt) => {
                                      const isChecked = cond.selectedIds.includes(opt.id)
                                      return (
                                        <div key={opt.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`${cond.id}-${opt.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                              handleConditionToggleId(cond.id, opt.id, checked === true)
                                            }
                                          />
                                          <Label
                                            htmlFor={`${cond.id}-${opt.id}`}
                                            className="font-normal cursor-pointer text-sm"
                                          >
                                            {opt.name}
                                          </Label>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                                {errors[`condition_${cond.id}`] && (
                                  <p className="text-xs text-destructive">
                                    {errors[`condition_${cond.id}`]}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Section D2: Customer Targeting (for customer_specific type) */}
              {selectedType.requiresCustomerEmails && (
                <>
                  <div>
                    <h3 className="text-base font-semibold mb-1">Customer Targeting</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Assign this coupon to specific customers. Select registered customers or add guest emails.
                    </p>
                    {errors.customerTargeting && (
                      <p className="text-sm text-destructive mb-3">{errors.customerTargeting}</p>
                    )}

                    {/* Registered Customers */}
                    <div className="space-y-2 mb-6">
                      <Label>Registered Customers</Label>
                      {isLoadingCustomers ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading customers...
                        </div>
                      ) : customerOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic py-2">
                          No registered customers found
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                          {customerOptions.map((cust) => {
                            const isChecked = selectedCustomerIds.includes(cust.id)
                            const displayName = [cust.first_name, cust.last_name].filter(Boolean).join(" ")
                            return (
                              <div key={cust.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`cust-${cust.id}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setSelectedCustomerIds(
                                      checked
                                        ? [...selectedCustomerIds, cust.id]
                                        : selectedCustomerIds.filter((id) => id !== cust.id)
                                    )
                                  }}
                                />
                                <Label
                                  htmlFor={`cust-${cust.id}`}
                                  className="font-normal cursor-pointer text-sm"
                                >
                                  {displayName ? `${displayName} (${cust.email})` : cust.email}
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {selectedCustomerIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">{selectedCustomerIds.length} customer(s) selected</span>
                        </p>
                      )}
                    </div>

                    {/* Guest Emails */}
                    <div className="space-y-2">
                      <Label>Guest Emails</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add email addresses for customers who may not have an account yet.
                      </p>
                      <div className="space-y-2">
                        {emailInputs.map((email, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="customer@example.com"
                              value={email}
                              onChange={(e) => {
                                const updated = [...emailInputs]
                                updated[index] = e.target.value
                                setEmailInputs(updated)
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => setEmailInputs(emailInputs.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEmailInputs([...emailInputs, ""])}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Email
                      </Button>
                      {emailInputs.filter((e) => e.trim()).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">{emailInputs.filter((e) => e.trim()).length} email(s) added</span>
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Customer must match either a selected customer OR an email to use this coupon.
                    </p>
                  </div>

                  <Separator />
                </>
              )}

              {/* Section E: Limits & Validity */}
              <div>
                <h3 className="text-base font-semibold mb-4">Limits & Validity</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minCartValue">Minimum Cart Value (Rs.)</Label>
                    <Input
                      id="minCartValue"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="No minimum"
                      value={minCartValue}
                      onChange={(e) => setMinCartValue(e.target.value)}
                      className="w-48"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Total Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Unlimited"
                      value={usageLimit}
                      onChange={(e) => {
                        setUsageLimit(e.target.value)
                        if (errors.usageLimit) setErrors(({ usageLimit: _, ...rest }) => rest)
                      }}
                      className="w-48"
                    />
                    {errors.usageLimit && (
                      <p className="text-sm text-destructive">{errors.usageLimit}</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="datetime-local"
                      value={validFrom}
                      onChange={(e) => {
                        setValidFrom(e.target.value)
                        // Clear validUntil error if now valid
                        if (validUntil && new Date(validUntil) > new Date(e.target.value)) {
                          setErrors(({ validUntil: _, ...rest }) => rest)
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="datetime-local"
                      value={validUntil}
                      min={validFrom || undefined}
                      onChange={(e) => {
                        setValidUntil(e.target.value)
                        if (errors.validUntil) setErrors(({ validUntil: _, ...rest }) => rest)
                      }}
                    />
                    {errors.validUntil && (
                      <p className="text-sm text-destructive">{errors.validUntil}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Terms & Conditions */}
              <div>
                <h3 className="text-base font-semibold mb-1">Terms & Conditions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Optional terms and conditions displayed to customers
                </p>
                <RichTextEditor
                  value={termsAndConditions}
                  onChange={setTermsAndConditions}
                  placeholder="Enter terms and conditions..."
                />
              </div>

              <Separator />

              {/* Section F: Settings */}
              <div>
                <h3 className="text-base font-semibold mb-4">Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={(checked) => setIsActive(checked === true)}
                    />
                    <Label htmlFor="isActive" className="font-normal">
                      Active — Coupon can be applied by customers
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="guestAllowed"
                      checked={guestAllowed}
                      onCheckedChange={(checked) => setGuestAllowed(checked === true)}
                      disabled={selectedType.fixedBehaviors.guestAllowed !== undefined}
                    />
                    <Label htmlFor="guestAllowed" className="font-normal">
                      Allow guest checkout
                      {selectedType.fixedBehaviors.guestAllowed !== undefined && (
                        <span className="text-muted-foreground ml-1">(fixed by type)</span>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showOnStorefront"
                      checked={showOnStorefront}
                      onCheckedChange={(checked) => setShowOnStorefront(checked === true)}
                      disabled={selectedType.fixedBehaviors.showOnStorefront !== undefined}
                    />
                    <Label htmlFor="showOnStorefront" className="font-normal">
                      Show on storefront — Visible in available coupons list
                      {selectedType.fixedBehaviors.showOnStorefront !== undefined && (
                        <span className="text-muted-foreground ml-1">(fixed by type)</span>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
