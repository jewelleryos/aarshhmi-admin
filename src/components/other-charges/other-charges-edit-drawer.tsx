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
import { Textarea } from "@/components/ui/textarea"
import { Receipt, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateOtherCharge } from "@/redux/slices/otherChargeSlice"
import { fromSmallestUnit } from "@/utils/currency"
import { toast } from "sonner"
import type { OtherCharge } from "@/redux/services/otherChargeService"

interface OtherChargesEditDrawerProps {
  otherCharge: OtherCharge | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OtherChargesEditDrawer({
  otherCharge,
  open,
  onOpenChange,
}: OtherChargesEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    amount?: string
  }>({})

  // Populate form when other charge changes
  useEffect(() => {
    if (otherCharge && open) {
      setName(otherCharge.name)
      setDescription(otherCharge.description || "")
      // Convert from smallest unit (paise) to display unit (rupees)
      setAmount(fromSmallestUnit(otherCharge.amount).toString())
      setErrors({})
    }
  }, [otherCharge, open])

  // Reset form
  const resetForm = () => {
    setName("")
    setDescription("")
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

  // Handle name change
  const handleNameChange = (value: string) => {
    setName(value)
    if (errors.name && value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }))
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!otherCharge) return

    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    } else if (name.trim().length > 100) {
      newErrors.name = "Name must be 100 characters or less"
    }

    if (!amount || parseFloat(amount) < 0) {
      newErrors.amount = "Amount must be non-negative"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateOtherCharge({
          id: otherCharge.id,
          data: {
            name: name.trim(),
            description: description.trim() || null,
            amount: parseFloat(amount),
          },
        })
      ).unwrap()

      toast.success("Other charge updated successfully")
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
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Other Charge</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update the charge details
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Enter charge name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive pl-[5px]">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">
              Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="edit-amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                inputMode="decimal"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the charge amount in rupees
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
                Updating...
              </>
            ) : (
              "Update Other Charge"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
