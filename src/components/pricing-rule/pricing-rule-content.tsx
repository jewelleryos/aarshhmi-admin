"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { PricingRuleTable } from "./pricing-rule-table"
import { DeleteDialogWithDelay } from "@/components/ui/delete-dialog-with-delay"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchPricingRules, deletePricingRule } from "@/redux/slices/pricingRuleSlice"
import { toast } from "sonner"
import type { PricingRule } from "./types"

export function PricingRuleContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.pricingRule)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.PRICING_RULE.CREATE)
  const canUpdate = has(PERMISSIONS.PRICING_RULE.UPDATE)
  const canDelete = has(PERMISSIONS.PRICING_RULE.DELETE)

  // Fetch all pricing rules on mount
  useEffect(() => {
    dispatch(fetchPricingRules())
  }, [dispatch])

  // Handle edit - navigate to edit page
  const handleEdit = (rule: PricingRule) => {
    if (!canUpdate) return
    router.push(`/masters/pricing-rule/${rule.id}/edit`)
  }

  // Handle delete - open dialog
  const handleDelete = (rule: PricingRule) => {
    if (!canDelete) return
    setSelectedRule(rule)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedRule) return

    try {
      const result = await dispatch(deletePricingRule(selectedRule.id)).unwrap()
      toast.success(result.message)
    } catch (err: unknown) {
      const error = err as string
      toast.error(error || "Something went wrong")
      throw err // Re-throw to keep dialog open on error
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing Rules</h1>
          <p className="text-muted-foreground">
            Manage pricing rules to calculate selling prices based on conditions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={() => router.push("/masters/pricing-rule/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PricingRuleTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {canDelete && selectedRule && (
        <DeleteDialogWithDelay
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Pricing Rule"
          description={`Are you sure you want to delete "${selectedRule.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
