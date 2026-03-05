"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Ticket } from "lucide-react"
import { DeleteDialogWithDelay } from "@/components/ui/delete-dialog-with-delay"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchCoupons, deleteCoupon } from "@/redux/slices/couponSlice"
import couponService from "@/redux/services/couponService"
import { toast } from "sonner"
import { CouponsTable } from "./coupons-table"
import type { CouponListItem } from "./types"

export function CouponsContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.coupon)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponListItem | null>(null)
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null)

  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.COUPON.CREATE)
  const canUpdate = has(PERMISSIONS.COUPON.UPDATE)
  const canDelete = has(PERMISSIONS.COUPON.DELETE)

  useEffect(() => {
    dispatch(fetchCoupons(undefined))
  }, [dispatch])

  const handleEdit = (coupon: CouponListItem) => {
    if (!canUpdate) return
    router.push(`/coupons/${coupon.id}/edit`)
  }

  const handleDelete = async (coupon: CouponListItem) => {
    if (!canDelete) return
    setSelectedCoupon(coupon)

    try {
      const response = await couponService.checkDependency(coupon.id)
      const activeCartCount = response.data?.activeCartCount || 0
      if (activeCartCount > 0) {
        setDeleteWarning(
          `This coupon is currently applied to ${activeCartCount} active cart${activeCartCount > 1 ? "s" : ""}. Deleting it will automatically remove it from those carts.`
        )
      } else {
        setDeleteWarning(null)
      }
    } catch {
      setDeleteWarning(null)
    }

    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCoupon) return

    try {
      const result = await dispatch(deleteCoupon(selectedCoupon.id)).unwrap()
      toast.success(result.message || "Coupon deleted successfully")
    } catch (error: any) {
      toast.error(error || "Failed to delete coupon")
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedCoupon(null)
      setDeleteWarning(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons for your store
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/coupons/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CouponsTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      {canDelete && (
        <DeleteDialogWithDelay
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open)
            if (!open) {
              setSelectedCoupon(null)
              setDeleteWarning(null)
            }
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Coupon"
          description={
            deleteWarning
              ? `Are you sure you want to delete coupon "${selectedCoupon?.code}"?\n\n${deleteWarning}\n\nThis action cannot be undone.`
              : `Are you sure you want to delete coupon "${selectedCoupon?.code}"? This action cannot be undone.`
          }
        />
      )}
    </div>
  )
}
