"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Clock, User, Package, Image as ImageIcon, Video } from "lucide-react"
import { getCdnUrl } from "@/utils/cdn"
import type { ProductReview } from "@/redux/services/productReviewService"

interface ProductReviewViewDrawerProps {
  review: ProductReview | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Format date for display
function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Render star rating
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}/5</span>
    </div>
  )
}

export function ProductReviewViewDrawer({
  review,
  open,
  onOpenChange,
}: ProductReviewViewDrawerProps) {
  if (!review) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-6">
        {/* Header */}
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-xl">Review Details</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {review.product_name} - {review.product_sku}
          </p>
        </SheetHeader>

        {/* Review Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reviewer
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{review.customer_name}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Rating
            </span>
          </div>
          <div className="bg-muted/50 rounded-md p-3">
            <StarRating rating={review.rating} />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Title
            </span>
          </div>
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-sm font-medium">{review.title}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </span>
          </div>
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-sm whitespace-pre-wrap">
              {review.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Media */}
        {review.media && review.media.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Media ({review.media.length})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {review.media.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-md overflow-hidden bg-muted"
                >
                  {item.type === "video" ? (
                    <video
                      src={getCdnUrl(item.path)}
                      className="h-full w-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={getCdnUrl(item.path)}
                      alt={item.alt_text || review.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {item.type === "video" && (
                    <div className="absolute bottom-1 right-1">
                      <Badge variant="secondary" className="text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={
                review.status
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }
            >
              {review.status ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="outline"
              className={
                review.approval_status === "approved"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : review.approval_status === "pending"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-red-50 text-red-600 border-red-200"
              }
            >
              {review.approval_status}
            </Badge>
            <Badge variant="secondary">{review.type}</Badge>
          </div>
        </div>

        {/* Dates */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dates
            </span>
          </div>
          <div className="space-y-2">
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Review Date</span>
              </div>
              <p className="text-sm font-medium">
                {formatDate(review.review_date)}
              </p>
            </div>
            {review.order_date && (
              <div className="bg-muted/50 rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Order Date
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {formatDate(review.order_date)}
                </p>
              </div>
            )}
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Created</span>
              </div>
              <p className="text-sm font-medium">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}