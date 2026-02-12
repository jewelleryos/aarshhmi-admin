"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Percent, Save } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchMrpMarkup, updateMrpMarkup } from "@/redux/slices/mrpMarkupSlice"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { toast } from "sonner"

export function MrpMarkupContent() {
  const dispatch = useAppDispatch()
  const { data, isLoading, isUpdating } = useAppSelector((state) => state.mrpMarkup)

  // Form state
  const [diamond, setDiamond] = useState("")
  const [gemstone, setGemstone] = useState("")
  const [pearl, setPearl] = useState("")
  const [makingCharge, setMakingCharge] = useState("")

  // Permissions
  const { has } = usePermissions()
  const canUpdate = has(PERMISSIONS.MRP_MARKUP.UPDATE)

  // Fetch MRP markup on mount
  useEffect(() => {
    dispatch(fetchMrpMarkup())
  }, [dispatch])

  // Populate form when data is loaded
  useEffect(() => {
    if (data) {
      setDiamond(data.diamond.toFixed(2))
      setGemstone(data.gemstone.toFixed(2))
      setPearl(data.pearl.toFixed(2))
      setMakingCharge(data.making_charge.toFixed(2))
    }
  }, [data])

  // Check if form values have changed
  const isDirty = useMemo(() => {
    if (!data) return false

    const currentDiamond = parseFloat(diamond) || 0
    const currentGemstone = parseFloat(gemstone) || 0
    const currentPearl = parseFloat(pearl) || 0
    const currentMakingCharge = parseFloat(makingCharge) || 0

    return (
      currentDiamond !== data.diamond ||
      currentGemstone !== data.gemstone ||
      currentPearl !== data.pearl ||
      currentMakingCharge !== data.making_charge
    )
  }, [data, diamond, gemstone, pearl, makingCharge])

  // Handle input change - allow only valid decimal input
  const handleInputChange = (
    value: string,
    setter: (val: string) => void
  ) => {
    // Allow empty, numbers, and one decimal point with max 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setter(value)
    }
  }

  // Handle save
  const handleSave = async () => {
    try {
      await dispatch(
        updateMrpMarkup({
          diamond: parseFloat(diamond) || 0,
          gemstone: parseFloat(gemstone) || 0,
          pearl: parseFloat(pearl) || 0,
          making_charge: parseFloat(makingCharge) || 0,
        })
      ).unwrap()

      toast.success("MRP markup updated successfully")
    } catch (err) {
      toast.error(err as string)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">MRP Markup</h1>
          <p className="text-muted-foreground">
            Configure markup percentages for MRP calculation
          </p>
        </div>
      </div>

      {/* MRP Markup Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Markup Percentages</CardTitle>
              <CardDescription>
                Set markup percentages for different categories
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Grid - All in one row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Diamond */}
                <div className="space-y-1.5">
                  <Label htmlFor="diamond" className="text-sm">Diamond</Label>
                  <div className="relative">
                    <Input
                      id="diamond"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={diamond}
                      onChange={(e) => handleInputChange(e.target.value, setDiamond)}
                      disabled={!canUpdate}
                      readOnly={!canUpdate}
                      className="pr-7 h-9 text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>

                {/* Gemstone */}
                <div className="space-y-1.5">
                  <Label htmlFor="gemstone" className="text-sm">Gemstone</Label>
                  <div className="relative">
                    <Input
                      id="gemstone"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={gemstone}
                      onChange={(e) => handleInputChange(e.target.value, setGemstone)}
                      disabled={!canUpdate}
                      readOnly={!canUpdate}
                      className="pr-7 h-9 text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>

                {/* Pearl */}
                <div className="space-y-1.5">
                  <Label htmlFor="pearl" className="text-sm">Pearl</Label>
                  <div className="relative">
                    <Input
                      id="pearl"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={pearl}
                      onChange={(e) => handleInputChange(e.target.value, setPearl)}
                      disabled={!canUpdate}
                      readOnly={!canUpdate}
                      className="pr-7 h-9 text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>

                {/* Making Charge */}
                <div className="space-y-1.5">
                  <Label htmlFor="makingCharge" className="text-sm">Making Charge</Label>
                  <div className="relative">
                    <Input
                      id="makingCharge"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={makingCharge}
                      onChange={(e) => handleInputChange(e.target.value, setMakingCharge)}
                      disabled={!canUpdate}
                      readOnly={!canUpdate}
                      className="pr-7 h-9 text-sm"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button - only shown when dirty and has permission */}
              {canUpdate && isDirty && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
