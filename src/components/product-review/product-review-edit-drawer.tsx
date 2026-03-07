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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Star, Loader2, Plus, X } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateProductReview, fetchProductReviews } from "@/redux/slices/productReviewSlice"
import { MediaPickerInput } from "@/components/media"
import { MediaPickerModal } from "@/components/media/media-picker-modal"
import { getCdnUrl } from "@/utils/cdn"
import { toast } from "sonner"
import type { ProductReview, ReviewMediaItem } from "@/redux/services/productReviewService"

interface ProductReviewEditDrawerProps {
  review: ProductReview | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateMediaId(): string {
  return "rm_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getMediaType(path: string): "image" | "video" {
  const ext = path.split(".").pop()?.toLowerCase() || ""
  return ext === "mp4" ? "video" : "image"
}

export function ProductReviewEditDrawer({ review, open, onOpenChange }: ProductReviewEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerImagePath, setCustomerImagePath] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [rating, setRating] = useState("")
  const [description, setDescription] = useState("")
  const [orderDate, setOrderDate] = useState("")
  const [reviewDate, setReviewDate] = useState("")
  const [media, setMedia] = useState<ReviewMediaItem[]>([])
  const [status, setStatus] = useState(true)

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when review changes
  useEffect(() => {
    if (review) {
      setCustomerName(review.customer_name)
      setCustomerImagePath(review.customer_image_path)
      setTitle(review.title)
      setRating(review.rating.toString())
      setDescription(review.description)
      setOrderDate(review.order_date || "")
      setReviewDate(review.review_date)
      setMedia(review.media || [])
      setStatus(review.status)
      setErrors({})
    }
  }, [review])

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) setErrors({})
    onOpenChange(isOpen)
  }

  const handleMediaSelect = (path: string) => {
    if (media.length >= 10) return
    setMedia((prev) => [
      ...prev,
      {
        id: generateMediaId(),
        type: getMediaType(path),
        path,
        alt_text: "",
      },
    ])
  }

  const handleMediaRemove = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }

  const handleMediaAltTextChange = (id: string, altText: string) => {
    setMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, alt_text: altText } : m))
    )
  }

  const handleSubmit = async () => {
    if (!review) return

    const newErrors: Record<string, string> = {}

    if (!customerName.trim()) newErrors.customer_name = "Customer name is required"
    if (!title.trim()) newErrors.title = "Title is required"
    if (!rating) newErrors.rating = "Rating is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!orderDate) newErrors.order_date = "Order date is required"
    if (!reviewDate) newErrors.review_date = "Review date is required"

    if (orderDate && reviewDate && new Date(reviewDate) < new Date(orderDate)) {
      newErrors.review_date = "Review date cannot be before order date"
    }

    if (orderDate && new Date(orderDate) > new Date()) {
      newErrors.order_date = "Order date cannot be in the future"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateProductReview({
          id: review.id,
          data: {
            customer_name: customerName.trim(),
            customer_image_path: customerImagePath,
            title: title.trim(),
            rating: parseInt(rating),
            description: description.trim(),
            order_date: orderDate,
            review_date: reviewDate,
            media,
            status,
          },
        })
      ).unwrap()

      toast.success("Review updated successfully")
      dispatch(fetchProductReviews())
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
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Review</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update system-generated product review
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Product (read-only) */}
          <div className="space-y-2">
            <Label>Product</Label>
            <Input
              value={review?.product_id || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Product cannot be changed</p>
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="editCustomerName">
              Customer Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editCustomerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                if (errors.customer_name) setErrors((prev) => ({ ...prev, customer_name: undefined as any }))
              }}
              maxLength={100}
            />
            {errors.customer_name && (
              <p className="text-sm text-destructive pl-1.25">{errors.customer_name}</p>
            )}
          </div>

          {/* Customer Image */}
          <MediaPickerInput
            label="Customer Image"
            value={customerImagePath}
            onChange={setCustomerImagePath}
            rootPath="/reviews/1"
            accept={["jpg", "jpeg", "png", "webp"]}
          />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="editTitle">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editTitle"
              placeholder="Enter review title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined as any }))
              }}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-destructive pl-1.25">{errors.title}</p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>
              Rating <span className="text-destructive">*</span>
            </Label>
            <Select value={rating} onValueChange={(val) => {
              setRating(val)
              if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined as any }))
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} Star{r !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rating && (
              <p className="text-sm text-destructive pl-1.25">{errors.rating}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="editDescription">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="editDescription"
              placeholder="Enter review description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined as any }))
              }}
              rows={4}
              maxLength={5000}
            />
            {errors.description && (
              <p className="text-sm text-destructive pl-1.25">{errors.description}</p>
            )}
          </div>

          {/* Order Date */}
          <div className="space-y-2">
            <Label htmlFor="editOrderDate">
              Order Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editOrderDate"
              type="date"
              value={orderDate}
              onChange={(e) => {
                setOrderDate(e.target.value)
                if (errors.order_date) setErrors((prev) => ({ ...prev, order_date: undefined as any }))
              }}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.order_date && (
              <p className="text-sm text-destructive pl-1.25">{errors.order_date}</p>
            )}
          </div>

          {/* Review Date */}
          <div className="space-y-2">
            <Label htmlFor="editReviewDate">
              Review Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editReviewDate"
              type="date"
              value={reviewDate}
              onChange={(e) => {
                setReviewDate(e.target.value)
                if (errors.review_date) setErrors((prev) => ({ ...prev, review_date: undefined as any }))
              }}
              min={orderDate || undefined}
            />
            {errors.review_date && (
              <p className="text-sm text-destructive pl-1.25">{errors.review_date}</p>
            )}
          </div>

          {/* Review Media */}
          <div className="space-y-2">
            <Label>Review Media</Label>
            <p className="text-sm text-muted-foreground">
              {media.length} / 10 media items
            </p>
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {media.map((item) => (
                  <div key={item.id} className="relative border rounded-lg p-2 space-y-2">
                    {item.type === "image" ? (
                      <img
                        src={getCdnUrl(item.path) || ""}
                        alt={item.alt_text}
                        className="h-20 w-full object-cover rounded"
                      />
                    ) : (
                      <div className="h-20 w-full bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                        Video
                      </div>
                    )}
                    <Input
                      placeholder="Alt text"
                      value={item.alt_text}
                      onChange={(e) => handleMediaAltTextChange(item.id, e.target.value)}
                      className="h-7 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleMediaRemove(item.id)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {media.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaPickerOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            )}
            <MediaPickerModal
              open={isMediaPickerOpen}
              onOpenChange={setIsMediaPickerOpen}
              rootPath="/reviews/1"
              onSelect={handleMediaSelect}
              accept={["jpg", "jpeg", "png", "webp", "mp4"]}
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="editStatus"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="editStatus" className="cursor-pointer">
              Active
            </Label>
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
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Review"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
