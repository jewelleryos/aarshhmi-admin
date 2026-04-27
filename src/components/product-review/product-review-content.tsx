"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchProductReviews } from "@/redux/slices/productReviewSlice"
import { ProductReviewTable } from "./product-review-table"
import { ProductReviewAddDrawer } from "./product-review-add-drawer"
import { ProductReviewEditDrawer } from "./product-review-edit-drawer"
import { ProductReviewViewDrawer } from "./product-review-view-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import productReviewService from "@/redux/services/productReviewService"
import type { ProductReviewListItem } from "@/redux/services/productReviewService"
import type { ProductReview } from "@/redux/services/productReviewService"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ProductReviewContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.productReview)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProductReviewListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Approval dialog state
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean
    item: ProductReviewListItem | null
    action: "approved" | "rejected"
  }>({ open: false, item: null, action: "approved" })
  const [isApproving, setIsApproving] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "system" | "user">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending" | "rejected">("all")

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.PRODUCT_REVIEW.CREATE)
  const canUpdate = has(PERMISSIONS.PRODUCT_REVIEW.UPDATE)
  const canDelete = has(PERMISSIONS.PRODUCT_REVIEW.DELETE)
  const canUserStatusUpdate = has(PERMISSIONS.PRODUCT_REVIEW.USER_STATUS_UPDATE)
  const canUserDelete = has(PERMISSIONS.PRODUCT_REVIEW.USER_DELETE)

  useEffect(() => {
    dispatch(fetchProductReviews())
  }, [dispatch])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false
      if (statusFilter === "active" && !item.status) return false
      if (statusFilter === "inactive" && item.status) return false
      if (approvalFilter !== "all" && item.approval_status !== approvalFilter) return false
      return true
    })
  }, [items, typeFilter, statusFilter, approvalFilter])

  const hasCustomFilter = typeFilter !== "all" || statusFilter !== "all" || approvalFilter !== "all"

  const handleResetFilters = () => {
    setTypeFilter("all")
    setStatusFilter("all")
    setApprovalFilter("all")
  }

  const filterComponent = (
    <>
      <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select value={approvalFilter} onValueChange={(v) => setApprovalFilter(v as typeof approvalFilter)}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Approval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Approvals</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  // Handle edit - fetch full review then open drawer
  const handleEdit = async (item: ProductReviewListItem) => {
    if (!canUpdate || item.type !== "system") return
    try {
      const response = await productReviewService.getById(item.id)
      setSelectedReview(response.data)
      setIsEditDrawerOpen(true)
    } catch {
      toast.error("Failed to load review details")
    }
  }

  // Handle view - fetch full review then open drawer
  const handleView = async (item: ProductReviewListItem) => {
    try {
      const response = await productReviewService.getById(item.id)
      setSelectedReview(response.data)
      setIsViewDrawerOpen(true)
    } catch {
      toast.error("Failed to load review details")
    }
  }

  // Handle delete click
  const handleDeleteClick = (item: ProductReviewListItem) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const result = await productReviewService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchProductReviews())
      setIsDeleteDialogOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (item: ProductReviewListItem) => {
    try {
      const result = await productReviewService.updateStatus(item.id, !item.status)
      toast.success(result.message)
      dispatch(fetchProductReviews())
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status")
    }
  }

  // Handle approve click
  const handleApprove = (item: ProductReviewListItem) => {
    setApprovalDialog({ open: true, item, action: "approved" })
  }

  // Handle reject click
  const handleReject = (item: ProductReviewListItem) => {
    setApprovalDialog({ open: true, item, action: "rejected" })
  }

  // Handle approval confirm
  const handleApprovalConfirm = async () => {
    if (!approvalDialog.item) return
    setIsApproving(true)
    try {
      const result = await productReviewService.updateApproval(
        approvalDialog.item.id,
        approvalDialog.action
      )
      toast.success(result.message)
      dispatch(fetchProductReviews())
      setApprovalDialog({ open: false, item: null, action: "approved" })
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update approval status")
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground">
            Manage product reviews
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Review
          </Button>
        )}
      </div>

      {/* Reviews Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProductReviewTable
              items={filteredItems}
              totalItems={items.length}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onStatusToggle={handleStatusToggle}
              onApprove={handleApprove}
              onReject={handleReject}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canUserStatusUpdate={canUserStatusUpdate}
              canUserDelete={canUserDelete}
              filterComponent={filterComponent}
              hasCustomFilter={hasCustomFilter}
              onResetFilters={handleResetFilters}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <ProductReviewAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer (system reviews only) */}
      {canUpdate && (
        <ProductReviewEditDrawer
          review={selectedReview}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* View Drawer */}
      <ProductReviewViewDrawer
        review={selectedReview}
        open={isViewDrawerOpen}
        onOpenChange={setIsViewDrawerOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by &quot;{deleteTarget?.customer_name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Confirmation Dialog */}
      <AlertDialog
        open={approvalDialog.open}
        onOpenChange={(open) => {
          if (!open) setApprovalDialog({ open: false, item: null, action: "approved" })
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalDialog.action === "approved" ? "Approve" : "Reject"} Review
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalDialog.action === "approved"
                ? "Are you sure you want to approve this review? It will become visible on the storefront once status is also active."
                : "Are you sure you want to reject this review?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovalConfirm}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {approvalDialog.action === "approved" ? "Approving..." : "Rejecting..."}
                </>
              ) : (
                approvalDialog.action === "approved" ? "Approve" : "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
