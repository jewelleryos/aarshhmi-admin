"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { updateCoupon } from "@/redux/slices/couponSlice"
import couponService from "@/redux/services/couponService"
import type { CouponDetail, CouponTypeDefinition, CouponCondition } from "./types"
import {
  TYPE_BADGE_COLORS,
  CONDITION_FIELD_LABELS,
  CONDITION_OPERATORS,
  NUMERIC_CONDITION_FIELDS,
  MULTI_SELECT_CONDITION_FIELDS,
} from "./types"

interface CouponEditProps {
  id: string
}

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

// Map condition field to its fetcher (edit uses /for-coupon-edit endpoints)
const CONDITION_FIELD_FETCHERS_EDIT: Record<string, (svc: typeof couponService) => Promise<any>> = {
  product_category: (svc) => svc.getCategoriesForEdit(),
  metal_type: (svc) => svc.getMetalTypesForEdit(),
  metal_color: (svc) => svc.getMetalColorsForEdit(),
  metal_purity: (svc) => svc.getMetalPuritiesForEdit(),
  diamond_clarity_color: (svc) => svc.getDiamondClarityColorsForEdit(),
  gemstone_color: (svc) => svc.getGemstoneColorsForEdit(),
  tag: (svc) => svc.getTagsForEdit(),
}

let conditionIdCounter = 0
function generateConditionId(): string {
  conditionIdCounter += 1
  return `cond_${Date.now()}_${conditionIdCounter}`
}

export function CouponEdit({ id }: CouponEditProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Loaded data
  const [coupon, setCoupon] = useState<CouponDetail | null>(null)
  const [typeDefinition, setTypeDefinition] = useState<CouponTypeDefinition | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Form state
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [displayText, setDisplayText] = useState("")

  // Discount fields
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat")
  const [discountValue, setDiscountValue] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [maxDiscountPerProduct, setMaxDiscountPerProduct] = useState("")

  // Conditions
  const [conditions, setConditions] = useState<ConditionState[]>([])
  const [conditionOptions, setConditionOptions] = useState<Record<string, DropdownOption[]>>({})
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // Limits & Validity
  const [minCartValue, setMinCartValue] = useState("")
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

  // Fetch dropdown options for multi-select condition fields
  const fetchConditionOptions = async (typeDef: CouponTypeDefinition) => {
    const multiSelectFields = typeDef.availableConditions.filter((f) =>
      MULTI_SELECT_CONDITION_FIELDS.has(f)
    )
    if (multiSelectFields.length === 0) return

    setIsLoadingOptions(true)
    try {
      const results: Record<string, DropdownOption[]> = {}
      await Promise.all(
        multiSelectFields.map(async (field) => {
          const fetcher = CONDITION_FIELD_FETCHERS_EDIT[field]
          if (fetcher) {
            const res = await fetcher(couponService)
            results[field] = res.data?.items || []
          }
        })
      )
      setConditionOptions(results)
    } catch (error) {
      console.error("Failed to fetch condition options:", error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // Fetch coupon data and type definition on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [couponRes, typesRes] = await Promise.all([
          couponService.getById(id),
          couponService.getTypes(),
        ])

        const couponData: CouponDetail = couponRes.data
        const types: CouponTypeDefinition[] = typesRes.data.types
        const typeDef = types.find((t) => t.code === couponData.type) || null

        setCoupon(couponData)
        setTypeDefinition(typeDef)

        // Populate form fields
        setCode(couponData.code)
        setDescription(couponData.description || "")
        setDisplayText(couponData.display_text || "")
        setIsActive(couponData.is_active)
        setGuestAllowed(couponData.guest_allowed)
        setShowOnStorefront(couponData.show_on_storefront)
        // Terms & Conditions
        if (couponData.metadata?.terms_and_conditions) {
          setTermsAndConditions(couponData.metadata.terms_and_conditions)
        }

        // Discount fields — convert paise back to Rs
        if (couponData.discount_type) {
          setDiscountType(couponData.discount_type)
        } else if (typeDef?.discountMode === "flat") {
          setDiscountType("flat")
        } else if (typeDef?.discountMode === "percentage") {
          setDiscountType("percentage")
        }

        if (couponData.discount_value) {
          setDiscountValue(String(couponData.discount_value / 100))
        }
        if (couponData.discount_percent) {
          setDiscountPercent(String(couponData.discount_percent))
        }
        if (couponData.max_discount) {
          setMaxDiscount(String(couponData.max_discount / 100))
        }
        if (couponData.max_discount_per_product) {
          setMaxDiscountPerProduct(String(couponData.max_discount_per_product / 100))
        }

        // Limits
        if (couponData.min_cart_value) {
          setMinCartValue(String(couponData.min_cart_value / 100))
        }
        if (couponData.valid_from) {
          setValidFrom(couponData.valid_from.slice(0, 16))
        }
        if (couponData.valid_until) {
          setValidUntil(couponData.valid_until.slice(0, 16))
        }
        if (couponData.usage_limit) {
          setUsageLimit(String(couponData.usage_limit))
        }

        // Conditions
        if (couponData.conditions && couponData.conditions.length > 0) {
          setConditions(
            couponData.conditions.map((c) => {
              const isMultiSelect = MULTI_SELECT_CONDITION_FIELDS.has(c.field)
              return {
                id: generateConditionId(),
                field: c.field,
                operator: c.operator,
                value: isMultiSelect
                  ? ""
                  : (c.field === "cart_subtotal" || c.field === "unit_price")
                    ? String(Number(c.value) / 100)
                    : String(c.value),
                selectedIds: isMultiSelect
                  ? (Array.isArray(c.value) ? c.value : [])
                  : [],
              }
            })
          )
        }

        // Customer targeting data
        if (couponData.assigned_customer_emails && couponData.assigned_customer_emails.length > 0) {
          setEmailInputs(couponData.assigned_customer_emails)
        }
        if (couponData.metadata?.assigned_customer_ids && couponData.metadata.assigned_customer_ids.length > 0) {
          setSelectedCustomerIds(couponData.metadata.assigned_customer_ids)
        }

        // Fetch dropdown options if type has multi-select conditions
        if (typeDef) {
          fetchConditionOptions(typeDef)
        }

        // Fetch customers for customer_specific type
        if (typeDef?.requiresCustomerEmails) {
          setIsLoadingCustomers(true)
          couponService.getCustomersForEdit()
            .then((res) => setCustomerOptions(res.data?.items || []))
            .catch(() => {})
            .finally(() => setIsLoadingCustomers(false))
        }
      } catch (error) {
        console.error("Failed to fetch coupon:", error)
        toast.error("Failed to load coupon")
        router.push("/coupons")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [id, router])

  // Condition helpers
  const handleAddCondition = () => {
    if (!typeDefinition) return
    const availableFields = typeDefinition.availableConditions.filter(
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

  const handleRemoveCondition = (condId: string) => {
    setConditions(conditions.filter((c) => c.id !== condId))
  }

  const handleConditionFieldChange = (condId: string, newField: string) => {
    const operators = CONDITION_OPERATORS[newField] || []
    setConditions(
      conditions.map((c) =>
        c.id === condId
          ? { ...c, field: newField, operator: operators[0]?.value || ">=", value: "", selectedIds: [] }
          : c
      )
    )
  }

  const handleConditionOperatorChange = (condId: string, operator: string) => {
    setConditions(
      conditions.map((c) => (c.id === condId ? { ...c, operator } : c))
    )
  }

  const handleConditionValueChange = (condId: string, value: string) => {
    setConditions(
      conditions.map((c) => (c.id === condId ? { ...c, value } : c))
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
    if (!typeDefinition) return false

    const newErrors: Record<string, string> = {}

    if (!code.trim()) {
      newErrors.code = "Code is required"
    }

    const mode = typeDefinition.discountMode
    const effectiveMode = mode === "configurable" ? discountType : mode

    if (effectiveMode === "flat") {
      if (!discountValue || Number(discountValue) <= 0) {
        newErrors.discountValue = "Discount amount is required"
      }
    } else if (effectiveMode === "percentage") {
      if (!discountPercent || Number(discountPercent) <= 0 || Number(discountPercent) > 100) {
        newErrors.discountPercent = "Valid percentage (0.01-100) is required"
      }
      if (!maxDiscount || Number(maxDiscount) <= 0) {
        newErrors.maxDiscount = "Max discount cap is required"
      }
    }

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

    // Customer targeting validation
    if (typeDefinition.requiresCustomerEmails) {
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
    if (!validate() || !coupon || !typeDefinition) return

    setIsSubmitting(true)

    try {
      const mode = typeDefinition.discountMode
      const payload: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
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
        if (typeDefinition.targetLevel === "product" && maxDiscountPerProduct) {
          payload.max_discount_per_product = Math.round(Number(maxDiscountPerProduct) * 100)
        }
      } else if (mode === "configurable") {
        payload.discount_type = discountType
        if (discountType === "flat") {
          payload.discount_value = Math.round(Number(discountValue) * 100)
          payload.discount_percent = null
          payload.max_discount = null
          payload.max_discount_per_product = null
        } else {
          payload.discount_percent = Number(discountPercent)
          payload.max_discount = Math.round(Number(maxDiscount) * 100)
          payload.discount_value = null
          if (maxDiscountPerProduct) {
            payload.max_discount_per_product = Math.round(Number(maxDiscountPerProduct) * 100)
          } else {
            payload.max_discount_per_product = null
          }
        }
      }

      // Customer targeting
      if (typeDefinition.requiresCustomerEmails) {
        const emails = emailInputs.map((e) => e.trim().toLowerCase()).filter(Boolean)
        payload.assigned_customer_emails = emails.length > 0 ? emails : null
        ;(payload.metadata as Record<string, unknown>).assigned_customer_ids = selectedCustomerIds.length > 0 ? selectedCustomerIds : null
      }

      // Conditions
      payload.conditions = conditions
        .filter((c) => {
          if (MULTI_SELECT_CONDITION_FIELDS.has(c.field)) return c.selectedIds.length > 0
          return c.value.trim() !== ""
        })
        .map((c): CouponCondition => {
          if (MULTI_SELECT_CONDITION_FIELDS.has(c.field)) {
            return { field: c.field, operator: c.operator, value: c.selectedIds }
          }
          let value: string | number = c.value.trim()
          if (c.field === "cart_subtotal" || c.field === "unit_price") {
            value = Math.round(Number(value) * 100)
          } else if (c.field === "item_count") {
            value = Number(value)
          }
          return { field: c.field, operator: c.operator, value }
        })

      const result = await dispatch(updateCoupon({ id: coupon.id, data: payload })).unwrap()
      toast.success(result.message || "Coupon updated successfully")
      router.push("/coupons")
    } catch (error: any) {
      toast.error(error || "Failed to update coupon")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!coupon || !typeDefinition) {
    return null
  }

  const colorClass =
    TYPE_BADGE_COLORS[coupon.type] || "bg-gray-50 text-gray-700 border-gray-200"

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
              <h1 className="text-2xl font-bold tracking-tight">Edit Coupon</h1>
              <p className="text-muted-foreground">
                Update coupon details
              </p>
            </div>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Type & Usage Stats Banner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Coupon Type</p>
              <Badge variant="outline" className={colorClass}>
                {typeDefinition.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Type cannot be changed after creation
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Usage</p>
              <p className="text-lg font-semibold">
                {coupon.usage_count} / {coupon.usage_limit ?? "Unlimited"}
              </p>
              {coupon.activeCartCount > 0 && (
                <p className="text-xs text-amber-600">
                  Applied in {coupon.activeCartCount} active cart{coupon.activeCartCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
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
                <Label htmlFor="edit-code">
                  Coupon Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-code"
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
                <Label htmlFor="edit-displayText">Display Text</Label>
                <Input
                  id="edit-displayText"
                  placeholder="e.g., Get Rs.500 off on your order!"
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
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

            {typeDefinition.discountMode === "configurable" && (
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
            {(typeDefinition.discountMode === "flat" ||
              (typeDefinition.discountMode === "configurable" && discountType === "flat")) && (
              <div className="space-y-2">
                <Label htmlFor="edit-discountValue">
                  Discount Amount (Rs.) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-discountValue"
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
            {(typeDefinition.discountMode === "percentage" ||
              (typeDefinition.discountMode === "configurable" && discountType === "percentage")) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-discountPercent">
                    Discount Percentage (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-discountPercent"
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
                  <Label htmlFor="edit-maxDiscount">
                    Max Discount Cap (Rs.) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-maxDiscount"
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
                {(typeDefinition.targetLevel === "product" ||
                  typeDefinition.availableConditions.some((f) => MULTI_SELECT_CONDITION_FIELDS.has(f))) && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-maxDiscountPerProduct">
                      Max Discount Per Product (Rs.)
                    </Label>
                    <Input
                      id="edit-maxDiscountPerProduct"
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
          {typeDefinition.availableConditions.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">Conditions</h3>
                    <p className="text-sm text-muted-foreground">
                      Optional rules that must be met for the coupon to apply
                    </p>
                  </div>
                  {conditions.length < typeDefinition.availableConditions.length && (
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
                    const availableFields = typeDefinition.availableConditions.filter(
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
          {typeDefinition.requiresCustomerEmails && (
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
                              id={`edit-cust-${cust.id}`}
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
                              htmlFor={`edit-cust-${cust.id}`}
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
                <Label htmlFor="edit-minCartValue">Minimum Cart Value (Rs.)</Label>
                <Input
                  id="edit-minCartValue"
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
                <Label htmlFor="edit-usageLimit">Total Usage Limit</Label>
                <Input
                  id="edit-usageLimit"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-validFrom">Valid From</Label>
                <Input
                  id="edit-validFrom"
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-validUntil">Valid Until</Label>
                <Input
                  id="edit-validUntil"
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
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
                  id="edit-isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <Label htmlFor="edit-isActive" className="font-normal">
                  Active — Coupon can be applied by customers
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-guestAllowed"
                  checked={guestAllowed}
                  onCheckedChange={(checked) => setGuestAllowed(checked === true)}
                  disabled={typeDefinition.fixedBehaviors.guestAllowed !== undefined}
                />
                <Label htmlFor="edit-guestAllowed" className="font-normal">
                  Allow guest checkout
                  {typeDefinition.fixedBehaviors.guestAllowed !== undefined && (
                    <span className="text-muted-foreground ml-1">(fixed by type)</span>
                  )}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-showOnStorefront"
                  checked={showOnStorefront}
                  onCheckedChange={(checked) => setShowOnStorefront(checked === true)}
                  disabled={typeDefinition.fixedBehaviors.showOnStorefront !== undefined}
                />
                <Label htmlFor="edit-showOnStorefront" className="font-normal">
                  Show on storefront — Visible in available coupons list
                  {typeDefinition.fixedBehaviors.showOnStorefront !== undefined && (
                    <span className="text-muted-foreground ml-1">(fixed by type)</span>
                  )}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
