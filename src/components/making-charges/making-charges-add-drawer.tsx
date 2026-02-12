"use client"

import { useState, useEffect } from "react"
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
import { Hammer, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createMakingCharge } from "@/redux/slices/makingChargeSlice"
import metalTypeService from "@/redux/services/metalTypeService"
import { toast } from "sonner"
interface MakingChargesAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MakingChargesAddDrawer({ open, onOpenChange }: MakingChargesAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Metal types for dropdown
  const [metalTypes, setMetalTypes] = useState<{ id: string; name: string }[]>([])
  const [isLoadingMetalTypes, setIsLoadingMetalTypes] = useState(false)

  // Form state
  const [selectedMetalType, setSelectedMetalType] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [isFixedPricing, setIsFixedPricing] = useState(true)
  const [amount, setAmount] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    metalType?: string
    from?: string
    to?: string
    amount?: string
  }>({})

  // Fetch metal types when drawer opens
  useEffect(() => {
    if (open) {
      setIsLoadingMetalTypes(true)
      metalTypeService
        .getForMakingCharge()
        .then((response) => {
          if (response.success) {
            setMetalTypes(response.data)
          }
        })
        .catch((err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          const message = error.response?.data?.message || "Something went wrong"
          toast.error(message)
        })
        .finally(() => setIsLoadingMetalTypes(false))
    }
  }, [open])

  // Reset form
  const resetForm = () => {
    setSelectedMetalType("")
    setFrom("")
    setTo("")
    setIsFixedPricing(true)
    setAmount("")
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

  // Handle metal type change
  const handleMetalTypeChange = (value: string) => {
    setSelectedMetalType(value)
    if (errors.metalType && value) {
      setErrors((prev) => ({ ...prev, metalType: undefined }))
    }
  }

  // Handle from weight change
  const handleFromChange = (value: string) => {
    // Allow empty, digits, and decimal point (up to 4 decimal places)
    if (value === "" || /^\d*\.?\d{0,4}$/.test(value)) {
      setFrom(value)
      if (errors.from && value) {
        setErrors((prev) => ({ ...prev, from: undefined }))
      }
    }
  }

  // Handle to weight change
  const handleToChange = (value: string) => {
    // Allow empty, digits, and decimal point (up to 4 decimal places)
    if (value === "" || /^\d*\.?\d{0,4}$/.test(value)) {
      setTo(value)
      if (errors.to && value) {
        setErrors((prev) => ({ ...prev, to: undefined }))
      }
    }
  }

  // Handle amount change
  const handleAmountChange = (value: string) => {
    // Allow empty, digits, and decimal point (up to 2 decimal places)
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value)
      if (errors.amount && value) {
        setErrors((prev) => ({ ...prev, amount: undefined }))
      }
    }
  }

  // Handle pricing type change
  const handlePricingTypeChange = (isFixed: boolean) => {
    setIsFixedPricing(isFixed)
    // Clear amount error when switching type
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate
    const newErrors: typeof errors = {}

    if (!selectedMetalType) {
      newErrors.metalType = "Metal type is required"
    }
    if (!from || parseFloat(from) < 0) {
      newErrors.from = "From weight is required and must be non-negative"
    }
    if (!to || parseFloat(to) <= 0) {
      newErrors.to = "To weight must be positive"
    }
    if (from && to && parseFloat(from) >= parseFloat(to)) {
      newErrors.to = "To weight must be greater than From weight"
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be positive"
    }
    // Percentage limit validation
    if (!isFixedPricing && amount && parseFloat(amount) > 100) {
      newErrors.amount = "Percentage cannot exceed 100"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        createMakingCharge({
          metal_type_id: selectedMetalType,
          from: parseFloat(from),
          to: parseFloat(to),
          is_fixed_pricing: isFixedPricing,
          amount: parseFloat(amount),
        })
      ).unwrap()

      toast.success("Making charge created successfully")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error(err as string)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Hammer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Making Charge</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new making charge for a metal type
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Metal Type Field */}
          <div className="space-y-2">
            <Label>
              Metal Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedMetalType}
              onValueChange={handleMetalTypeChange}
              disabled={isLoadingMetalTypes}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingMetalTypes ? "Loading..." : "Select metal type"} />
              </SelectTrigger>
              <SelectContent>
                {metalTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metalType && (
              <p className="text-sm text-destructive pl-[5px]">{errors.metalType}</p>
            )}
          </div>

          {/* Weight Range Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* From Weight */}
            <div className="space-y-2">
              <Label htmlFor="from">
                From (grams) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="from"
                placeholder="0"
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
                inputMode="decimal"
              />
              {errors.from && (
                <p className="text-sm text-destructive pl-[5px]">{errors.from}</p>
              )}
            </div>

            {/* To Weight */}
            <div className="space-y-2">
              <Label htmlFor="to">
                To (grams) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="to"
                placeholder="0"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                inputMode="decimal"
              />
              {errors.to && (
                <p className="text-sm text-destructive pl-[5px]">{errors.to}</p>
              )}
            </div>
          </div>

          {/* Pricing Type Toggle */}
          <div className="space-y-2">
            <Label>Pricing Type</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isFixedPricing ? "default" : "outline"}
                size="sm"
                onClick={() => handlePricingTypeChange(true)}
              >
                Fixed Price
              </Button>
              <Button
                type="button"
                variant={!isFixedPricing ? "default" : "outline"}
                size="sm"
                onClick={() => handlePricingTypeChange(false)}
              >
                Percentage
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFixedPricing
                ? "Fixed price per gram of metal"
                : "Percentage of the gold price"
              }
            </p>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              {isFixedPricing ? "Amount per gram" : "Percentage"} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              {isFixedPricing ? (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₹
                </span>
              ) : null}
              <Input
                id="amount"
                placeholder={isFixedPricing ? "0.00" : "0.00"}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                inputMode="decimal"
                className={isFixedPricing ? "pl-8" : "pr-8"}
              />
              {!isFixedPricing ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {isFixedPricing
                ? "Enter the fixed amount per gram"
                : "Enter the percentage (max 100)"
              }
            </p>
            {errors.amount && (
              <p className="text-sm text-destructive pl-[5px]">{errors.amount}</p>
            )}
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
              "Create Making Charge"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
